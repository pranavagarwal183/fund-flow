import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KYCRequest {
  panNumber: string;
  fullName: string;
}

interface KYCResponse {
  status: 'approved' | 'pending' | 'not_found' | 'error';
  message: string;
  details?: any;
}

// Mock KYC verification function
// In production, this would integrate with CAMS KRA API
async function verifyKYCWithCAMS(panNumber: string, fullName: string): Promise<KYCResponse> {
  try {
    // This is a mock implementation
    // In production, you would:
    // 1. Make an authenticated request to CAMS KRA API
    // 2. Pass the PAN number and other required parameters
    // 3. Handle the response according to CAMS KRA documentation
    
    // For demo purposes, we'll simulate different responses based on PAN format
    if (!panNumber || !fullName) {
      return {
        status: 'error',
        message: 'PAN number and full name are required'
      };
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      return {
        status: 'error',
        message: 'Invalid PAN format'
      };
    }

    // Mock KYC status based on PAN (for demo purposes)
    // In production, this would be the actual response from CAMS KRA
    const mockKYCStatuses = {
      'ABCDE1234F': 'approved',
      'FGHIJ5678K': 'pending',
      'LMNOP9012Q': 'not_found',
    };

    const kycStatus = mockKYCStatuses[panNumber as keyof typeof mockKYCStatuses] || 'approved';

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    switch (kycStatus) {
      case 'approved':
        return {
          status: 'approved',
          message: 'KYC verification successful',
          details: {
            panNumber,
            fullName,
            kycStatus: 'approved',
            verifiedAt: new Date().toISOString(),
            source: 'CAMS KRA'
          }
        };
      
      case 'pending':
        return {
          status: 'pending',
          message: 'KYC verification is pending',
          details: {
            panNumber,
            fullName,
            kycStatus: 'pending',
            source: 'CAMS KRA'
          }
        };
      
      case 'not_found':
        return {
          status: 'not_found',
          message: 'KYC not found for the provided PAN',
          details: {
            panNumber,
            fullName,
            kycStatus: 'not_found',
            source: 'CAMS KRA'
          }
        };
      
      default:
        return {
          status: 'approved',
          message: 'KYC verification successful',
          details: {
            panNumber,
            fullName,
            kycStatus: 'approved',
            verifiedAt: new Date().toISOString(),
            source: 'CAMS KRA'
          }
        };
    }
  } catch (error) {
    console.error('KYC verification error:', error);
    return {
      status: 'error',
      message: 'Failed to verify KYC status',
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

    // Get request body
    const body: KYCRequest = await req.json()
    
    if (!body.panNumber || !body.fullName) {
      return new Response(
        JSON.stringify({ error: 'PAN number and full name are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify KYC with CAMS
    const kycResult = await verifyKYCWithCAMS(body.panNumber, body.fullName)

    // Log the verification attempt (for audit purposes)
    console.log('KYC verification attempt:', {
      panNumber: body.panNumber,
      fullName: body.fullName,
      result: kycResult.status,
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
