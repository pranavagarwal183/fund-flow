import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketDataRequest {
  schemeCodes: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schemeCodes }: MarketDataRequest = await req.json();
    
    if (!schemeCodes || !Array.isArray(schemeCodes)) {
      return new Response(
        JSON.stringify({ error: 'Invalid scheme codes provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client for fetching scheme data
    const supabaseUrl = 'https://zrozbgygozyzziuzwlap.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch fund data from our database
    const { data: funds, error } = await supabase
      .from('mutual_fund_schemes')
      .select('*')
      .in('scheme_code', schemeCodes)
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch fund data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform fund data to include market data format
    const marketData = funds.map(fund => {
      // Calculate 30-day performance data (mock data for now)
      const baseValue = fund.current_nav || 100;
      const performanceData = Array.from({ length: 30 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.02; // ±1% daily variation
        const value = baseValue * (1 + variation * (i / 30));
        return {
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nav: parseFloat(value.toFixed(2))
        };
      });

      return {
        scheme_code: fund.scheme_code,
        scheme_name: fund.scheme_name,
        amc_name: fund.amc_name,
        fund_category: fund.fund_category,
        fund_subcategory: fund.fund_subcategory,
        risk_level: fund.risk_level,
        current_nav: fund.current_nav,
        nav_date: new Date().toISOString().split('T')[0],
        returns: {
          '1_day': fund.return_1day,
          '1_week': fund.return_1week,
          '1_month': fund.return_1month,
          '3_month': fund.return_3month,
          '6_month': fund.return_6month,
          '1_year': fund.return_1year,
          '3_year': fund.return_3year,
          '5_year': fund.return_5year,
        },
        aum: fund.aum,
        expense_ratio: fund.expense_ratio,
        minimum_sip: fund.minimum_sip_amount,
        minimum_lumpsum: fund.minimum_lumpsum_amount,
        fund_manager: fund.fund_manager_name,
        fund_manager_experience: fund.fund_manager_experience,
        performance_data: performanceData,
        last_updated: new Date().toISOString(),
      };
    });

    // Add caching headers for 5 minutes
    const cacheHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // 5 minutes
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: marketData,
        count: marketData.length,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: cacheHeaders 
      }
    );

  } catch (error) {
    console.error('Error in fetch-market-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});