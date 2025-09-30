import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CachedFundData {
  fund_id: string;
  fund_name: string;
  category: string;
  nav: number;
  low_52_week: number;
  high_52_week: number;
  expense_ratio: number;
  aum: string;
  risk_level: string;
  return_1y: number;
  return_3y: number;
  return_5y: number;
  rating: number;
  nav_date: string;
  last_updated: string;
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
      .from('latest_fund_data')
      .select('*')
      .order('last_updated', { ascending: false });

    // Filter by specific fund IDs if provided
    if (fundIds && Array.isArray(fundIds) && fundIds.length > 0) {
      query = query.in('fund_id', fundIds);
    }

    // Filter by search term if provided
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      query = query.or(`fund_name.ilike.%${searchTerm.trim()}%,category.ilike.%${searchTerm.trim()}%`);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: funds, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cached fund data: ${error.message}`);
    }

    // Transform data to match the expected format
    const transformedFunds = (funds || []).map((fund: CachedFundData) => ({
      id: fund.fund_id,
      name: fund.fund_name,
      category: fund.category,
      nav: fund.nav,
      low52: fund.low_52_week,
      high52: fund.high_52_week,
      expenseRatio: fund.expense_ratio,
      aum: fund.aum,
      riskLevel: fund.risk_level,
      returns: {
        "1Y": fund.return_1y,
        "3Y": fund.return_3y,
        "5Y": fund.return_5y,
      },
      rating: fund.rating,
      navDate: fund.nav_date,
      lastUpdated: fund.last_updated,
      isRecommended: fund.return_5y > 15 && fund.expense_ratio < 2,
    }));

    // Get cache metadata
    const { data: cacheInfo } = await supabase
      .from('fund_data_cache')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    return new Response(JSON.stringify({
      success: true,
      data: transformedFunds,
      metadata: {
        total_funds: transformedFunds.length,
        cache_last_updated: cacheInfo?.last_updated || null,
        data_freshness: cacheInfo?.last_updated ? 
          `Data as of ${new Date(cacheInfo.last_updated).toLocaleString()}` : 
          'Data freshness unknown'
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

