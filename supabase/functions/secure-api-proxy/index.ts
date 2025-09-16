import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface APIRequest {
  endpoint: string;
  method?: string;
  params?: Record<string, any>;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Secure API proxy to prevent API key exposure
async function proxyAPIRequest(request: APIRequest): Promise<APIResponse> {
  try {
    const API_KEY = Deno.env.get('INDIAN_STOCK_API_KEY');
    
    if (!API_KEY) {
      return {
        success: false,
        error: 'API configuration error'
      };
    }

    const baseUrl = 'https://api.data.gov.in/resource';
    let url = `${baseUrl}/${request.endpoint}`;
    
    // Add API key and other parameters
    const urlParams = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      ...request.params
    });
    
    url += `?${urlParams.toString()}`;

    const response = await fetch(url, {
      method: request.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FundFlow-SecureProxy/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('API proxy error:', error);
    return {
      success: false,
      error: error.message || 'API request failed'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { endpoint, method, params } = await req.json() as APIRequest;

    if (!endpoint) {
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate allowed endpoints (security measure)
    const allowedEndpoints = [
      'amc-details',
      'mutual-fund-schemes',
      'nav-history'
    ];

    const isAllowedEndpoint = allowedEndpoints.some(allowed => 
      endpoint.includes(allowed) || allowed.includes(endpoint)
    );

    if (!isAllowedEndpoint) {
      return new Response(
        JSON.stringify({ success: false, error: 'Endpoint not allowed' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await proxyAPIRequest({ endpoint, method, params });

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Secure API proxy error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});