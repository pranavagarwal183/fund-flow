# KYC Integration Guide: External Providers & Database Population

## Overview
This guide explains how to integrate with actual KYC verification providers and populate your database with verified KYC data.

## How the Hybrid System Works

### 1. **Local Database Check First**
- Searches existing KYC records in your database
- If found and completed → returns immediately
- If found but pending → updates to completed
- If not found → proceeds to external verification

### 2. **External KYC Verification**
- Integrates with actual KYC providers (CAMS KRA, NSDL, etc.)
- Verifies PAN number against official databases
- Returns real-time KYC status

### 3. **Database Population**
- Stores external verification results for future use
- Eliminates need for repeated external API calls
- Builds comprehensive KYC database over time

## KYC Provider Integration Options

### Option 1: CAMS KRA (Recommended)
**Provider**: Computer Age Management Services (CAMS)
**Coverage**: Comprehensive KRA database
**API**: REST API with authentication

```typescript
// Example CAMS KRA integration
async function verifyKYCWithCAMS(panNumber: string): Promise<KYCResponse> {
  try {
    const response = await fetch('https://api.camskra.com/kyc/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CAMS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pan_number: panNumber,
        request_id: generateRequestId(),
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    
    // Parse CAMS response and convert to your format
    return {
      status: result.kyc_status === 'VERIFIED' ? 'completed' : 'pending',
      message: result.message,
      source: 'external',
      details: {
        panNumber,
        kycStatus: result.kyc_status,
        verifiedAt: result.verification_date,
        source: 'CAMS KRA',
        additionalData: result.additional_details
      }
    };
  } catch (error) {
    throw new Error(`CAMS KRA verification failed: ${error.message}`);
  }
}
```

### Option 2: NSDL (National Securities Depository Limited)
**Provider**: NSDL
**Coverage**: Securities market participants
**API**: SOAP/REST API

### Option 3: Karvy
**Provider**: Karvy Computershare
**Coverage**: Financial services KYC
**API**: REST API

### Option 4: Multiple Provider Aggregation
**Approach**: Check multiple providers for comprehensive coverage

```typescript
async function verifyKYCWithMultipleProviders(panNumber: string): Promise<KYCResponse> {
  const providers = [
    { name: 'CAMS KRA', verify: verifyKYCWithCAMS },
    { name: 'NSDL', verify: verifyKYCWithNSDL },
    { name: 'Karvy', verify: verifyKYCWithKarvy }
  ];

  for (const provider of providers) {
    try {
      const result = await provider.verify(panNumber);
      if (result.status === 'completed') {
        return { ...result, source: 'external' };
      }
    } catch (error) {
      console.warn(`${provider.name} verification failed:`, error);
      continue; // Try next provider
    }
  }

  return {
    status: 'not_found',
    message: 'KYC not found in any external provider',
    source: 'external'
  };
}
```

## Database Population Strategies

### Strategy 1: On-Demand Population
- **When**: User submits PAN for verification
- **How**: Check external sources and store results
- **Pros**: Real-time data, no upfront cost
- **Cons**: API call costs, slower response times

### Strategy 2: Batch Population
- **When**: Scheduled intervals (daily/weekly)
- **How**: Process multiple PANs in batches
- **Pros**: Cost-effective, faster subsequent lookups
- **Cons**: Data may be outdated

### Strategy 3: Hybrid Approach (Recommended)
- **When**: Combination of both strategies
- **How**: Check local first, external on-demand, batch updates
- **Pros**: Best of both worlds
- **Cons**: More complex implementation

## Implementation Steps

### Step 1: Choose KYC Provider
1. **Research providers** based on your needs
2. **Compare pricing** (per API call vs. subscription)
3. **Check coverage** (geographic, demographic)
4. **Evaluate API quality** (response time, reliability)

### Step 2: Get API Access
1. **Register** with chosen provider
2. **Get API credentials** (API key, secret)
3. **Test sandbox environment**
4. **Review rate limits** and pricing

### Step 3: Update Edge Function
1. **Replace mock functions** with real API calls
2. **Add proper error handling**
3. **Implement retry logic**
4. **Add rate limiting**

### Step 4: Set Environment Variables
```bash
# Add to your Supabase edge function environment
CAMS_API_KEY=your_cams_api_key
CAMS_API_SECRET=your_cams_api_secret
NSDL_API_KEY=your_nsdl_api_key
KARVY_API_KEY=your_karvy_api_key
```

## Cost Considerations

### API Call Costs
- **CAMS KRA**: ₹2-5 per verification
- **NSDL**: ₹1-3 per verification
- **Karvy**: ₹2-4 per verification

### Optimization Strategies
1. **Cache results** in database (already implemented)
2. **Batch verification** for multiple PANs
3. **Scheduled updates** for existing records
4. **Fallback providers** for cost optimization

## Security & Compliance

### Data Protection
- **Encrypt sensitive data** in database
- **Secure API credentials**
- **Audit logging** for all verifications
- **GDPR compliance** for data handling

### API Security
- **HTTPS only** for all API calls
- **API key rotation** (monthly/quarterly)
- **Rate limiting** to prevent abuse
- **IP whitelisting** if supported

## Testing & Validation

### Test Cases
1. **Valid PAN numbers** (should return completed)
2. **Invalid PAN numbers** (should return error)
3. **Non-existent PANs** (should return not_found)
4. **Rate limiting** (should handle gracefully)
5. **API failures** (should fallback gracefully)

### Test Data
```typescript
const testPANs = [
  'ABCDE1234F', // Valid format, should verify
  'FGHIJ5678K', // Valid format, pending status
  'LMNOP9012Q', // Valid format, not found
  'INVALID123', // Invalid format, should reject
  '1234567890', // Invalid format, should reject
];
```

## Monitoring & Analytics

### Key Metrics
- **Verification success rate**
- **API response times**
- **Cost per verification**
- **Database hit rate** (local vs. external)

### Alerts
- **API failures** (immediate)
- **High error rates** (daily)
- **Cost thresholds** (monthly)
- **Performance degradation** (real-time)

## Migration from Mock to Real

### Phase 1: Setup & Testing
1. Get API access from chosen provider
2. Implement real API integration
3. Test in sandbox environment
4. Validate response parsing

### Phase 2: Gradual Rollout
1. Deploy to staging environment
2. Test with real PAN numbers
3. Monitor performance and costs
4. Gradually increase traffic

### Phase 3: Production
1. Deploy to production
2. Monitor real-world usage
3. Optimize based on data
4. Scale as needed

## Example Production Implementation

```typescript
// Production-ready KYC verification
async function verifyKYCProduction(panNumber: string): Promise<KYCResponse> {
  try {
    // Step 1: Check local database
    const localResult = await checkLocalDatabase(panNumber);
    if (localResult.status === 'completed') {
      return { ...localResult, source: 'database' };
    }

    // Step 2: Check external providers
    const externalResult = await verifyKYCWithCAMS(panNumber);
    
    // Step 3: Store result for future use
    if (externalResult.status === 'completed') {
      await storeKYCResult(panNumber, externalResult);
    }

    return { ...externalResult, source: 'external' };

  } catch (error) {
    // Fallback to cached data if available
    const cachedResult = await getCachedKYCResult(panNumber);
    if (cachedResult) {
      return { ...cachedResult, source: 'cached' };
    }

    throw error;
  }
}
```

## Next Steps

1. **Choose your KYC provider** based on requirements
2. **Get API access** and credentials
3. **Update the edge function** with real integration
4. **Test thoroughly** in sandbox environment
5. **Deploy gradually** to production
6. **Monitor and optimize** based on usage patterns

This hybrid approach ensures you have both immediate access to external KYC data and a growing local database for faster future verifications.
