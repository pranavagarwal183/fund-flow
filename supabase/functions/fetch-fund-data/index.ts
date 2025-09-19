import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundSearchResponse {
  id: string;
  name: string;
  category: string;
  nav: number;
  low52: number;
  high52: number;
  expenseRatio: number;
  aum: string;
  riskLevel: string;
  returns: {
    "1Y": number;
    "3Y": number;
    "5Y": number;
  };
  rating: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fundName } = await req.json();
    
    if (!fundName) {
      throw new Error('Fund name is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = `Search for mutual fund information for "${fundName}" and return ONLY a JSON array of funds with the exact structure below. Include the latest NAV, 52-week high/low, expense ratio, and return data. Return multiple relevant funds if available:

[{
  "id": "unique_fund_identifier",
  "name": "Full Fund Name",
  "category": "Fund Category (e.g., Large Cap, Mid Cap, etc.)",
  "nav": current_nav_value,
  "low52": 52_week_low_value,
  "high52": 52_week_high_value,
  "expenseRatio": expense_ratio_percentage,
  "aum": "₹XXX Cr",
  "riskLevel": "Low|Moderate|High|Very High",
  "returns": {
    "1Y": one_year_return_percentage,
    "3Y": three_year_annualized_return_percentage,
    "5Y": five_year_annualized_return_percentage
  },
  "rating": rating_out_of_5
}]

Only return the JSON array, no additional text or explanation.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const funds: FundSearchResponse[] = JSON.parse(jsonMatch[0]);
    
    // Validate and sanitize the response
    const validatedFunds = funds.map(fund => ({
      id: fund.id || fund.name,
      name: fund.name || 'Unknown Fund',
      category: fund.category || 'Unknown',
      nav: Number(fund.nav) || 0,
      low52: Number(fund.low52) || 0,
      high52: Number(fund.high52) || 0,
      expenseRatio: Number(fund.expenseRatio) || 0,
      aum: fund.aum || '₹0 Cr',
      riskLevel: fund.riskLevel || 'Moderate',
      returns: {
        "1Y": Number(fund.returns?.["1Y"]) || 0,
        "3Y": Number(fund.returns?.["3Y"]) || 0,
        "5Y": Number(fund.returns?.["5Y"]) || 0,
      },
      rating: Math.min(Math.max(Number(fund.rating) || 3, 1), 5),
    }));

    return new Response(JSON.stringify({ 
      success: true, 
      data: validatedFunds 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-fund-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});