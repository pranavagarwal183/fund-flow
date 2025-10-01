import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MutualFundScheme {
  id: string;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const { fundIds, searchTerm, limit = 50 } = requestBody;

    let query = supabase
      .from('mutual_fund_schemes')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Filter by specific fund IDs if provided
    if (fundIds && Array.isArray(fundIds) && fundIds.length > 0) {
      query = query.in('id', fundIds);
    }

    // Filter by search term if provided
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      query = query.or(`scheme_name.ilike.%${searchTerm.trim()}%,amc_name.ilike.%${searchTerm.trim()}%,fund_category.ilike.%${searchTerm.trim()}%`);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: funds, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cached fund data: ${error.message}`);
    }

    // Transform data to match the expected format
    const transformedFunds = (funds || []).map((fund: MutualFundScheme) => {
      // Calculate 52-week high/low (using NAV as base with some variance for demo)
      const navVariance = fund.current_nav * 0.15;
      const low52 = fund.current_nav - navVariance;
      const high52 = fund.current_nav + navVariance;
      
      // Calculate rating based on returns (1-5 stars)
      const avgReturn = (fund.return_1year + fund.return_3year + fund.return_5year) / 3;
      let rating = 3;
      if (avgReturn > 20) rating = 5;
      else if (avgReturn > 15) rating = 4;
      else if (avgReturn < 8) rating = 2;
      
      return {
        id: fund.id,
        name: fund.scheme_name,
        category: `${fund.fund_category} - ${fund.fund_subcategory}`,
        nav: fund.current_nav,
        low52: Math.round(low52 * 100) / 100,
        high52: Math.round(high52 * 100) / 100,
        expenseRatio: fund.expense_ratio,
        aum: `₹${Math.round(fund.aum)} Cr`,
        riskLevel: fund.risk_level,
        returns: {
          "1Y": fund.return_1year,
          "3Y": fund.return_3year,
          "5Y": fund.return_5year,
        },
        rating: rating,
        isRecommended: fund.return_5year > 15 && fund.expense_ratio < 1.5,
      };
    });

    // Get most recent update time from funds
    const mostRecentUpdate = funds && funds.length > 0 
      ? funds.reduce((latest, fund) => {
          const fundDate = new Date(fund.updated_at);
          return fundDate > latest ? fundDate : latest;
        }, new Date(funds[0].updated_at))
      : null;

    return new Response(JSON.stringify({
      success: true,
      data: transformedFunds,
      metadata: {
        total_funds: transformedFunds.length,
        data_freshness: mostRecentUpdate 
          ? `Data as of ${mostRecentUpdate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}` 
          : 'Data freshness unknown'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-cached-fund-data function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      data: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

