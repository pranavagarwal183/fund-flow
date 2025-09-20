import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundDetailResponse {
  scheme_code: string;
  scheme_name: string;
  amc_name: string;
  fund_category: string;
  fund_subcategory: string;
  risk_level: string;
  current_nav: number;
  minimum_sip_amount: number;
  minimum_lumpsum_amount: number;
  expense_ratio: number;
  aum: number;
  return_1day: number;
  return_1week: number;
  return_1month: number;
  return_3month: number;
  return_6month: number;
  return_1year: number;
  return_3year: number;
  return_5year: number;
  fund_manager_name: string;
  fund_manager_experience: number;
  launch_date: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');

    if (!GEMINI_API_KEY || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL) {
      throw new Error('Missing required environment variables');
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all ISIN data
    const { data: isinData, error: fetchError } = await supabase
      .from('isin_data')
      .select('*');

    if (fetchError) {
      throw new Error(`Failed to fetch ISIN data: ${fetchError.message}`);
    }

    console.log(`Processing ${isinData?.length || 0} funds from ISIN data`);

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const fund of isinData || []) {
      try {
        console.log(`Processing fund: ${fund.fund_name}`);

        const prompt = `Get detailed mutual fund information for "${fund.fund_name}" with ISIN "${fund.isin}" and return ONLY a JSON object with the exact structure below. Use the latest available data:

{
  "scheme_code": "fund_identifier_or_isin",
  "scheme_name": "Full Fund Name",
  "amc_name": "Asset Management Company Name",
  "fund_category": "Category (e.g., Equity, Debt, Hybrid)",
  "fund_subcategory": "Subcategory (e.g., Large Cap, Mid Cap, etc.)",
  "risk_level": "Low|Moderate|High|Very High",
  "current_nav": current_nav_value,
  "minimum_sip_amount": 500,
  "minimum_lumpsum_amount": 5000,
  "expense_ratio": expense_ratio_percentage,
  "aum": aum_in_crores,
  "return_1day": one_day_return_percentage,
  "return_1week": one_week_return_percentage,
  "return_1month": one_month_return_percentage,
  "return_3month": three_month_return_percentage,
  "return_6month": six_month_return_percentage,
  "return_1year": one_year_return_percentage,
  "return_3year": three_year_annualized_return_percentage,
  "return_5year": five_year_annualized_return_percentage,
  "fund_manager_name": "Fund Manager Name",
  "fund_manager_experience": years_of_experience,
  "launch_date": "YYYY-MM-DD"
}

Only return the JSON object, no additional text or explanation.`;

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
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`Rate limited for fund: ${fund.fund_name}, skipping...`);
            continue;
          }
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          throw new Error('Invalid response from Gemini API');
        }

        const responseText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in response');
        }

        const fundDetails: FundDetailResponse = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the response
        const sanitizedData = {
          scheme_code: fundDetails.scheme_code || fund.isin,
          scheme_name: fundDetails.scheme_name || fund.fund_name,
          amc_name: fundDetails.amc_name || 'Unknown',
          fund_category: fundDetails.fund_category || 'Unknown',
          fund_subcategory: fundDetails.fund_subcategory || 'Unknown',
          risk_level: fundDetails.risk_level || 'Moderate',
          current_nav: Number(fundDetails.current_nav) || 10,
          minimum_sip_amount: Number(fundDetails.minimum_sip_amount) || 500,
          minimum_lumpsum_amount: Number(fundDetails.minimum_lumpsum_amount) || 5000,
          expense_ratio: Number(fundDetails.expense_ratio) || 1.5,
          aum: Number(fundDetails.aum) || 100,
          return_1day: Number(fundDetails.return_1day) || 0,
          return_1week: Number(fundDetails.return_1week) || 0,
          return_1month: Number(fundDetails.return_1month) || 0,
          return_3month: Number(fundDetails.return_3month) || 0,
          return_6month: Number(fundDetails.return_6month) || 0,
          return_1year: Number(fundDetails.return_1year) || 10,
          return_3year: Number(fundDetails.return_3year) || 12,
          return_5year: Number(fundDetails.return_5year) || 14,
          fund_manager_name: fundDetails.fund_manager_name || 'Unknown',
          fund_manager_experience: Number(fundDetails.fund_manager_experience) || 5,
          launch_date: fundDetails.launch_date || '2020-01-01',
          is_active: true,
        };

        // Insert into mutual_fund_schemes table
        const { error: insertError } = await supabase
          .from('mutual_fund_schemes')
          .upsert(sanitizedData, { 
            onConflict: 'scheme_code',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error(`Failed to insert fund ${fund.fund_name}:`, insertError);
          errorCount++;
        } else {
          console.log(`Successfully processed fund: ${fund.fund_name}`);
          successCount++;
        }

        results.push({
          fund_name: fund.fund_name,
          isin: fund.isin,
          status: insertError ? 'error' : 'success',
          error: insertError?.message || null
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing fund ${fund.fund_name}:`, error);
        errorCount++;
        results.push({
          fund_name: fund.fund_name,
          isin: fund.isin,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Processed ${isinData?.length || 0} funds. Success: ${successCount}, Errors: ${errorCount}`,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in populate-fund-schemes function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});