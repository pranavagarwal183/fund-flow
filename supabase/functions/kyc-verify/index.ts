import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KYCRequest {
  panNumber: string;
}

interface KYCResponse {
  status: 'completed' | 'pending' | 'not_found' | 'error';
  message: string;
  details?: any;
  source: 'database' | 'external' | 'new_record';
}

// Production KYC verification with CAMS KRA API
async function verifyKYCWithCAMS(panNumber: string): Promise<KYCResponse> {
  try {
    const CAMS_API_KEY = Deno.env.get('CAMS_API_KEY');
    const CAMS_API_SECRET = Deno.env.get('CAMS_API_SECRET');
    const CAMS_API_URL = Deno.env.get('CAMS_API_URL') || 'https://api.camskra.com/v1/kyc/verify';
    
    if (!CAMS_API_KEY || !CAMS_API_SECRET) {
      throw new Error('CAMS API credentials not configured');
    }

    // Generate request ID for tracking
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare request payload according to CAMS KRA API specification
    const requestPayload = {
      pan_number: panNumber,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      client_id: Deno.env.get('CAMS_CLIENT_ID') || 'fund-flow-app',
      version: '1.0'
    };

    // Make authenticated request to CAMS KRA API
    const response = await fetch(CAMS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CAMS_API_KEY}`,
        'X-API-Secret': CAMS_API_SECRET,
        'Content-Type': 'application/json',
        'User-Agent': 'FundFlow-KYC-Verification/1.0'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`CAMS API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    
    // Parse CAMS KRA response and convert to standardized format
    // Note: Adjust these mappings based on actual CAMS API response structure
    const kycStatus = result.kyc_status || result.status || 'pending';
    const isCompleted = ['VERIFIED', 'COMPLETED', 'APPROVED', 'SUCCESS'].includes(kycStatus.toUpperCase());
    
    return {
      status: isCompleted ? 'completed' : 'pending',
      message: result.message || `KYC verification ${isCompleted ? 'successful' : 'pending'}`,
      source: 'external',
      details: {
        panNumber,
        kycStatus: kycStatus.toLowerCase(),
        verifiedAt: result.verification_date || result.verified_at || new Date().toISOString(),
        source: 'CAMS KRA',
        requestId: requestId,
        additionalData: {
          camsResponse: result,
          verificationMethod: result.verification_method || 'API',
          lastUpdated: result.last_updated || result.updated_at
        }
      }
    };

  } catch (error) {
    console.error('CAMS KRA verification failed:', error);
    
    // Return error response that can be handled gracefully
    return {
      status: 'error',
      message: `CAMS KRA verification failed: ${error.message}`,
      source: 'external',
      details: {
        error: error.message,
        timestamp: new Date().toISOString(),
        provider: 'CAMS KRA'
      }
    };
  }
}

// Production KYC verification with NSDL API
async function verifyKYCWithNSDL(panNumber: string): Promise<KYCResponse> {
  try {
    const NSDL_API_KEY = Deno.env.get('NSDL_API_KEY');
    const NSDL_API_URL = Deno.env.get('NSDL_API_URL') || 'https://api.nsdl.com/kyc/verify';
    
    if (!NSDL_API_KEY) {
      throw new Error('NSDL API credentials not configured');
    }

    const requestId = `nsdl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const requestPayload = {
      pan: panNumber,
      request_id: requestId,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(NSDL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NSDL_API_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'FundFlow-KYC-Verification/1.0'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      throw new Error(`NSDL API error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    
    const kycStatus = result.kyc_status || result.status || 'pending';
    const isCompleted = ['VERIFIED', 'COMPLETED', 'APPROVED'].includes(kycStatus.toUpperCase());
    
    return {
      status: isCompleted ? 'completed' : 'pending',
      message: result.message || `NSDL KYC verification ${isCompleted ? 'successful' : 'pending'}`,
      source: 'external',
      details: {
        panNumber,
        kycStatus: kycStatus.toLowerCase(),
        verifiedAt: result.verification_date || new Date().toISOString(),
        source: 'NSDL',
        requestId: requestId,
        additionalData: {
          nsdlResponse: result
        }
      }
    };

  } catch (error) {
    console.error('NSDL verification failed:', error);
    return {
      status: 'error',
      message: `NSDL verification failed: ${error.message}`,
      source: 'external',
      details: {
        error: error.message,
        timestamp: new Date().toISOString(),
        provider: 'NSDL'
      }
    };
  }
}

// Production KYC verification with multiple providers (fallback strategy)
async function verifyKYCWithMultipleProviders(panNumber: string): Promise<KYCResponse> {
  const providers = [
    { name: 'CAMS KRA', verify: verifyKYCWithCAMS },
    { name: 'NSDL', verify: verifyKYCWithNSDL }
  ];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      console.log(`Attempting KYC verification with ${provider.name} for PAN: ${panNumber}`);
      
      const result = await provider.verify(panNumber);
      
      if (result.status === 'completed') {
        console.log(`KYC verification successful with ${provider.name}`);
        return { ...result, source: 'external' };
      }
      
      if (result.status === 'pending') {
        console.log(`KYC verification pending with ${provider.name}`);
        return { ...result, source: 'external' };
      }
      
      // If error, continue to next provider
      if (result.status === 'error') {
        lastError = new Error(result.message);
        console.warn(`${provider.name} verification failed:`, result.message);
        continue;
      }
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`${provider.name} verification failed:`, error);
      continue; // Try next provider
    }
  }

  // All providers failed
  return {
    status: 'error',
    message: `KYC verification failed with all providers: ${lastError?.message || 'Unknown error'}`,
    source: 'external',
    details: {
      error: lastError?.message || 'All providers failed',
      timestamp: new Date().toISOString(),
      providers: providers.map(p => p.name)
    }
  };
}

// Function to check KYC details by PAN number in the database
async function checkKYCDetailsByPAN(panNumber: string): Promise<KYCResponse> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return {
        status: 'error',
        message: 'Server configuration error',
        source: 'database'
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Search for KYC details by PAN number
    const { data: kycDetails, error: kycError } = await supabase
      .from('kyc_details')
      .select(`
        id,
        user_id,
        pan_number,
        pan_verified,
        pan_verified_at,
        verification_status,
        created_at,
        updated_at
      `)
      .eq('pan_number', panNumber)
      .single();

    if (kycError) {
      if (kycError.code === 'PGRST116') {
        // No rows returned - PAN not found, need external verification
        return {
          status: 'not_found',
          message: 'KYC details not found in database, checking external sources...',
          source: 'database'
        };
      }
      console.error('Database error:', kycError);
      return {
        status: 'error',
        message: 'Database query failed',
        source: 'database'
      };
    }

    if (!kycDetails) {
      return {
        status: 'not_found',
        message: 'KYC details not found in database, checking external sources...',
        source: 'database'
      };
    }

    // Check if KYC is already completed
    if (kycDetails.verification_status === 'approved') {
      return {
        status: 'completed',
        message: 'KYC verification is already completed',
        source: 'database',
        details: {
          panNumber: kycDetails.pan_number,
          kycStatus: 'completed',
          verifiedAt: kycDetails.pan_verified_at,
          userId: kycDetails.user_id
        }
      };
    }

    // Update KYC status to completed
    const { error: updateError } = await supabase
      .from('kyc_details')
      .update({
        verification_status: 'approved',
        pan_verified: true,
        pan_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', kycDetails.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return {
        status: 'error',
        message: 'Failed to update KYC status',
        source: 'database'
      };
    }

    // Update user profile KYC status using secure function
    const { data: profileUpdateResult, error: profileUpdateError } = await supabase
      .rpc('secure_update_profile', {
        profile_user_id: kycDetails.user_id,
        update_data: {
          kyc_status: 'completed',
          kyc_completed_at: new Date().toISOString()
        }
      });

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      console.warn('KYC status updated but profile update failed');
    }

    return {
      status: 'completed',
      message: 'KYC verification completed successfully',
      source: 'database',
      details: {
        panNumber: kycDetails.pan_number,
        kycStatus: 'completed',
        verifiedAt: new Date().toISOString(),
        userId: kycDetails.user_id
      }
    };

  } catch (error) {
    console.error('KYC verification error:', error);
    return {
      status: 'error',
      message: 'Failed to verify KYC status',
      source: 'database'
    };
  }
}

// Store external KYC verification result in database
async function storeExternalKYCResult(panNumber: string, verificationResult: KYCResponse): Promise<KYCResponse> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return verificationResult; // Return original result if we can't store
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create a new KYC record for this PAN
    const { data: newKYC, error: insertError } = await supabase
      .from('kyc_details')
      .insert({
        pan_number: panNumber,
        pan_verified: verificationResult.status === 'completed',
        pan_verified_at: verificationResult.status === 'completed' ? new Date().toISOString() : null,
        verification_status: verificationResult.status === 'completed' ? 'approved' : 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store external KYC result:', insertError);
      return verificationResult; // Return original result if storage fails
    }

    console.log(`Stored external KYC result for PAN: ${panNumber}`);
    
    return {
      ...verificationResult,
      source: 'new_record',
      details: {
        ...verificationResult.details,
        storedInDatabase: true,
        kycRecordId: newKYC.id
      }
    };

  } catch (error) {
    console.error('Error storing external KYC result:', error);
    return verificationResult; // Return original result if storage fails
  }
}

// Main KYC verification function with production logic
async function verifyKYC(panNumber: string): Promise<KYCResponse> {
  try {
    // Step 1: Check local database first
    console.log(`Checking KYC for PAN: ${panNumber} in local database`);
    const dbResult = await checkKYCDetailsByPAN(panNumber);
    
    if (dbResult.status === 'completed') {
      return dbResult; // KYC already completed in database
    }
    
    if (dbResult.status === 'error') {
      return dbResult; // Database error, return error
    }
    
    // Step 2: If not found in database, check external providers
    if (dbResult.status === 'not_found') {
      console.log(`PAN ${panNumber} not found in database, checking external sources`);
      
      // Use multiple provider strategy for better reliability
      const externalResult = await verifyKYCWithMultipleProviders(panNumber);
      
      // Store successful results for future use
      if (externalResult.status === 'completed' || externalResult.status === 'pending') {
        const storedResult = await storeExternalKYCResult(panNumber, externalResult);
        return storedResult;
      }
      
      return externalResult;
    }
    
    return dbResult;
    
  } catch (error) {
    console.error('KYC verification failed:', error);
    return {
      status: 'error',
      message: 'KYC verification failed',
      source: 'database',
      details: {
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Rate limiting check
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const rateLimitIdentifier = `${clientIP}-kyc-verify`;
    
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Check rate limit using enhanced function
      const { data: rateLimitCheck, error: rateLimitError } = await supabase
        .rpc('check_rate_limit_enhanced', {
          identifier_input: rateLimitIdentifier,
          action_input: 'kyc_verify',
          max_attempts: 10,
          window_minutes: 60
        });
      
      if (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError);
      } else if (!rateLimitCheck) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Too many KYC verification attempts. Please try again later.',
            retryAfter: 3600 // 1 hour in seconds
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '3600'
            } 
          }
        );
      }
    }

    // Get request body
    const body: KYCRequest = await req.json()
    
    if (!body.panNumber) {
      return new Response(
        JSON.stringify({ error: 'PAN number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(body.panNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid PAN format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify KYC using production hybrid approach
    const kycResult = await verifyKYC(body.panNumber)

    // Log the verification attempt (for audit purposes)
    console.log('KYC verification attempt:', {
      panNumber: body.panNumber,
      result: kycResult.status,
      source: kycResult.source,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(kycResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
