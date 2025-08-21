import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MandateRequest {
  bankAccount: string;
  maxAmount: string;
  authMethod: 'netbanking' | 'debit_card';
  debitCardNumber?: string;
  debitCardExpiry?: string;
}

interface MandateResponse {
  success: boolean;
  message: string;
  mandateId?: string;
  mandateReference?: string;
  details?: any;
}

// Mock mandate registration function
// In production, this would integrate with payment gateway (Razorpay, Cashfree, etc.)
async function registerNACHMandate(data: MandateRequest, userId: string): Promise<MandateResponse> {
  try {
    // This is a mock implementation
    // In production, you would:
    // 1. Integrate with payment gateway for NACH mandate registration
    // 2. Handle authentication via net banking or debit card
    // 3. Process mandate creation with bank
    // 4. Handle callback URLs for mandate confirmation
    
    // Validate required fields
    if (!data.bankAccount || !data.maxAmount || !data.authMethod) {
      return {
        success: false,
        message: 'Missing required fields for mandate registration'
      };
    }

    // Validate amount
    const maxAmount = parseFloat(data.maxAmount);
    if (isNaN(maxAmount) || maxAmount < 500) {
      return {
        success: false,
        message: 'Invalid amount. Minimum amount is ₹500'
      };
    }

    if (maxAmount > 1000000) {
      return {
        success: false,
        message: 'Maximum amount exceeded. Maximum limit is ₹10,00,000'
      };
    }

    // Validate debit card details if selected
    if (data.authMethod === 'debit_card') {
      if (!data.debitCardNumber || !data.debitCardExpiry) {
        return {
          success: false,
          message: 'Debit card details are required for card authentication'
        };
      }
    }

    // Mock mandate ID generation
    const mandateId = `MAN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const mandateReference = `NACH${Date.now()}`;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock successful mandate registration
    return {
      success: true,
      message: 'NACH e-mandate registered successfully',
      mandateId: mandateId,
      mandateReference: mandateReference,
      details: {
        registrationDate: new Date().toISOString(),
        status: 'active',
        bankAccount: data.bankAccount,
        maxAmount: maxAmount,
        frequency: 'monthly',
        startDate: new Date().toISOString(),
        authMethod: data.authMethod,
        mandateId: mandateId,
        mandateReference: mandateReference
      }
    };

  } catch (error) {
    console.error('Mandate registration error:', error);
    return {
      success: false,
      message: 'Failed to register NACH mandate',
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
    const body: MandateRequest = await req.json()

    // Register NACH mandate
    const mandateResult = await registerNACHMandate(body, user.id)

    if (!mandateResult.success) {
      return new Response(
        JSON.stringify(mandateResult),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Store mandate details in the database (you may want to create a mandates table)
    // For now, we'll just log it
    console.log('Mandate registration completed:', {
      userId: user.id,
      mandateId: mandateResult.mandateId,
      mandateReference: mandateResult.mandateReference,
      maxAmount: body.maxAmount,
      authMethod: body.authMethod,
      timestamp: new Date().toISOString()
    })

    return new Response(
      JSON.stringify(mandateResult),
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