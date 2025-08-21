import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CANRequest {
  fathersName: string;
  mothersName: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  permanentAddress: string;
  correspondenceAddress: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  taxResidency: string;
  taxIdNumber?: string;
  nomineeName: string;
  nomineeRelationship: string;
  nomineeDob: string;
  panNumber: string;
  panDocumentUrl: string;
  aadhaarDocumentUrl: string;
}

interface CANResponse {
  success: boolean;
  message: string;
  canNumber?: string;
  details?: any;
}

// Mock CAN registration function
// In production, this would integrate with MF Utilities API
async function registerCANWithMFU(data: CANRequest): Promise<CANResponse> {
  try {
    // This is a mock implementation
    // In production, you would:
    // 1. Make an authenticated request to MF Utilities API
    // 2. Submit all the CAN registration data
    // 3. Handle document uploads to MFU system
    // 4. Process the response and generate CAN number
    
    // Validate required fields
    const requiredFields = [
      'fathersName', 'mothersName', 'dateOfBirth', 'gender', 'occupation',
      'permanentAddress', 'correspondenceAddress', 'city', 'state', 'pincode',
      'bankName', 'accountNumber', 'ifscCode', 'accountType',
      'nomineeName', 'nomineeRelationship', 'nomineeDob',
      'panNumber', 'panDocumentUrl', 'aadhaarDocumentUrl'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof CANRequest]) {
        return {
          success: false,
          message: `Missing required field: ${field}`
        };
      }
    }

    // Mock CAN number generation (format: 8-digit number)
    const canNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful registration
    return {
      success: true,
      message: 'CAN registration completed successfully',
      canNumber: canNumber,
      details: {
        registrationDate: new Date().toISOString(),
        status: 'registered',
        mfuReference: `MFU${Date.now()}`,
        canNumber: canNumber
      }
    };

  } catch (error) {
    console.error('CAN registration error:', error);
    return {
      success: false,
      message: 'Failed to register CAN',
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request body
    const body: CANRequest = await req.json()

    // Register CAN with MF Utilities
    const canResult = await registerCANWithMFU(body)

    if (!canResult.success) {
      return new Response(
        JSON.stringify(canResult),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update KYC details with comprehensive information
    const { error: kycError } = await supabaseClient
      .from('kyc_details')
      .upsert({
        user_id: user.id,
        pan_number: body.panNumber,
        pan_document_url: body.panDocumentUrl,
        aadhaar_document_url: body.aadhaarDocumentUrl,
        bank_name: body.bankName,
        bank_account_number: body.accountNumber,
        bank_ifsc_code: body.ifscCode,
        address_line1: body.permanentAddress,
        address_line2: body.correspondenceAddress,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        country: 'India',
        verification_status: 'can_registered',
        pan_verified: true,
        pan_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (kycError) {
      console.error('KYC update error:', kycError);
    }

    // Log the registration attempt
    console.log('CAN registration completed:', {
      userId: user.id,
      canNumber: canResult.canNumber,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(canResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Internal server error',
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})