import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FundData {
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

interface CacheUpdateResult {
  success: boolean;
  message: string;
  funds_updated: number;
  last_updated: string;
  errors?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Gemini API key
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // List of fund companies to fetch data for
    const fundCompanies = [
      "ICICI Mutual Fund",
      "HDFC Mutual Fund", 
      "Axis Mutual Fund",
      "SBI Mutual Fund",
      "Kotak Mutual Fund",
      "Nippon Mutual Fund",
      "Quant Mutual Fund",
      "Mirae Asset Mutual Fund",
      "Franklin Templeton Mutual Fund",
      "UTI Mutual Fund"
    ];

    const results: CacheUpdateResult = {
      success: true,
      message: 'Fund data cache updated successfully',
      funds_updated: 0,
      last_updated: new Date().toISOString(),
      errors: []
    };

    // Fetch fund data for each company
    for (const companyName of fundCompanies) {
      try {
        console.log(`Fetching data for ${companyName}...`);
        
        const fundData = await fetchFundDataFromGemini(companyName, GEMINI_API_KEY);
        
        if (fundData && fundData.length > 0) {
          // Insert/update fund data in cache
          const insertResult = await insertFundDataToCache(supabase, fundData);
          results.funds_updated += insertResult.inserted_count;
          
          console.log(`Successfully cached ${insertResult.inserted_count} funds for ${companyName}`);
        } else {
          console.warn(`No fund data received for ${companyName}`);
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error fetching data for ${companyName}:`, error);
        results.errors?.push(`${companyName}: ${error.message}`);
      }
    }

    // Clean up old cache entries
    try {
      const { error: cleanupError } = await supabase.rpc('cleanup_old_fund_cache');
      if (cleanupError) {
        console.warn('Failed to cleanup old cache entries:', cleanupError);
      }
    } catch (error) {
      console.warn('Cleanup function failed:', error);
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-fund-data-cache function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      last_updated: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchFundDataFromGemini(companyName: string, apiKey: string): Promise<FundData[]> {
  const prompt = `Search for mutual fund information for "${companyName}" and return ONLY a JSON array of funds with the exact structure below. Include the latest NAV, 52-week high/low, expense ratio, and return data. Return multiple relevant funds if available:

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

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey, {
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
    if (response.status === 404) {
      throw new Error('Gemini API model not found. Please check your API key and model availability.');
    }
    
    if (response.status === 403) {
      throw new Error('Gemini API access denied. Please check your API key permissions.');
    }
    
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
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

  const funds: FundData[] = JSON.parse(jsonMatch[0]);
  
  // Validate and sanitize the response
  return funds.map(fund => ({
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
}

async function insertFundDataToCache(supabase: any, funds: FundData[]): Promise<{ inserted_count: number }> {
  const today = new Date().toISOString().split('T')[0];
  
  // Prepare data for insertion
  const cacheData = funds.map(fund => ({
    fund_id: fund.id,
    fund_name: fund.name,
    category: fund.category,
    nav: fund.nav,
    low_52_week: fund.low52,
    high_52_week: fund.high52,
    expense_ratio: fund.expenseRatio,
    aum: fund.aum,
    risk_level: fund.riskLevel,
    return_1y: fund.returns["1Y"],
    return_3y: fund.returns["3Y"],
    return_5y: fund.returns["5Y"],
    rating: fund.rating,
    nav_date: today,
    last_updated: new Date().toISOString()
  }));

  // Use upsert to handle duplicates
  const { data, error } = await supabase
    .from('fund_data_cache')
    .upsert(cacheData, { 
      onConflict: 'fund_id,nav_date',
      ignoreDuplicates: false 
    })
    .select('id');

  if (error) {
    throw new Error(`Failed to insert fund data: ${error.message}`);
  }

  return { inserted_count: data?.length || 0 };
}

