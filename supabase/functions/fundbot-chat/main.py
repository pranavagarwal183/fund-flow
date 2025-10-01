import os
import json
import asyncio
from typing import Dict, Any

import httpx
from groq import Groq


def _get_groq_client() -> Groq | None:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)


async def _get_mutual_fund_data(target_funds: Dict[str, str]) -> str | None:
    fund_data_str = ""
    async with httpx.AsyncClient() as client:
        for scheme_code, scheme_name in target_funds.items():
            try:
                api_url = f"https://api.mfapi.in/mf/{scheme_code}"
                resp = await client.get(api_url, timeout=10)
                resp.raise_for_status()
                data = resp.json()

                latest_nav_list = data.get("data", [])
                if latest_nav_list:
                    latest_nav_data = latest_nav_list[0]
                    fund_house = data.get("meta", {}).get("fund_house")
                    nav = latest_nav_data.get("nav")

                    fund_data_str += f"- **{scheme_name}**\n"
                    fund_data_str += f"  - Fund House: {fund_house}\n"
                    fund_data_str += f"  - Latest NAV: ₹{nav}\n\n"
            except httpx.RequestError:
                # Network issue; continue to next fund
                continue
            except (KeyError, IndexError, json.JSONDecodeError):
                # Malformed payload; continue to next fund
                continue

    return fund_data_str if fund_data_str else None


async def _handle_chat_async(body: Dict[str, Any]) -> Dict[str, Any]:
    groq_client = _get_groq_client()
    if not groq_client:
        return {"error": "Groq API key is not configured."}

    user_message = (body or {}).get("message", "").strip()
    if not user_message:
        return {"error": "Missing 'message' in request body."}

    fund_data = "No fund data was fetched for this general query."
    recommendation_keywords = [
        "recommend",
        "suggest",
        "which funds",
        "name some funds",
        "advise me on funds",
    ]

    if any(keyword in user_message.lower() for keyword in recommendation_keywords):
        target_funds_with_codes = {
            "120531": "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
            "120828": "Quant Small Cap Fund - Direct Plan - Growth",
            "120465": "Axis Bluechip Fund - Direct Plan - Growth",
            "120493": "UTI Nifty 50 Index Fund - Direct Plan - Growth",
            "119062": "Mirae Asset Large Cap Fund - Direct Plan - Growth",
            "100987": "SBI Contra Fund - Direct Plan - Growth",
        }
        fetched_data = await _get_mutual_fund_data(target_funds_with_codes)
        fund_data = fetched_data or "Could not retrieve live fund data at the moment."

    system_prompt = (
        "You are FinBot, a friendly and modern AI assistant designed to make Indian mutual funds "
        "easy to understand. 🤖 Your personality is casual, encouraging, and helpful, just like a "
        "modern fintech app. You can use emojis where appropriate to maintain a positive and engaging "
        "tone. Your primary goal is to answer user questions about Indian mutual funds, explaining "
        "concepts like SIPs, NAV, expense ratios, different fund types (Equity, Debt, Hybrid, ELSS, etc.) "
        "in simple terms. You operate under a strict set of rules: --- RULE 1: DUAL MODES You have two "
        "modes: \"General Q&A\" and \"Recommendation.\" Your default mode is always \"General Q&A.\" "
        "RULE 2: THE RECOMMENDATION TRIGGER You will ONLY enter \"Recommendation\" mode if the user's "
        "message contains explicit keywords like \"recommend,\" \"suggest,\" \"which funds,\" \"name some funds,\" "
        "or \"advise me on funds.\" - If the trigger words are NOT present: Respond with general information. "
        "- If the trigger words ARE present: You may proceed to give recommendations based on the rules below. "
        "RULE 3: RECOMMENDATION LOGIC When providing recommendations, adhere strictly: Only use the fund data "
        "provided in the prompt. Recommend a maximum of three funds. Match the fund category to the user's risk "
        "profile. Provide a simple one-sentence justification per fund. "
        "RULE 4: PROFESSIONAL FORMATTING FOR RECOMMENDATIONS When providing financial recommendations, you MUST "
        "follow this exact structure: "
        "(1) Opening: Start with a brief, encouraging greeting using emojis (e.g., '👋 Here are the top suggestions "
        "based on your query:' or '🚀 Here\\'s a structured list of options:'). "
        "(2) Data Presentation: ALWAYS use a Markdown table with columns for Fund Name, Category, and Justification. "
        "The fund name MUST be in **bold** format within the table. Example: | **Fund Name** | Category | Justification | "
        "(3) Separator: After the table, insert a horizontal line using exactly three dashes: --- "
        "(4) Disclaimer Block: Following the separator, present the disclaimer in this EXACT format with bold emphasis: "
        "**Disclaimer:** I am an AI assistant and this is not official financial advice. **All investments carry market "
        "risks. Please do your own research or consult with a SEBI-registered financial advisor before investing.** 📈 "
        "DO NOT use asterisks for footnotes or any other disclaimer formatting. "
        "RULE 5: STAYING IN YOUR LANE Your expertise is limited to Indian mutual funds only. Politely decline other topics. "
        "RULE 6: NO DATA FALLBACK If recommendations are requested but no fund data is available, say you cannot "
        "recommend specific funds."
    )

    user_prompt = f"""
Here is the latest data on some available mutual funds. If the user did not ask for a recommendation, this section will be empty or state that no data was fetched.
<fund_data>
{fund_data}
</fund_data>

The user's message is: "{user_message}"

Please respond to the user based on all your rules and the provided information.
"""

    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            model="openai/gpt-oss-120b",
        )
        reply = chat_completion.choices[0].message.content
        return {"reply": reply}
    except Exception:
        return {"error": "An error occurred while communicating with the AI model."}


def main(req):  # Supabase Python function entrypoint
    try:
        body = req.json
    except Exception:
        body = {}

    result = asyncio.run(_handle_chat_async(body))
    # Return tuple (body, status_code, headers)
    return (json.dumps(result), 200, {"Content-Type": "application/json"})


