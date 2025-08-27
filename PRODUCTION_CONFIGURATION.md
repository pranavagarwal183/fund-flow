# Production Configuration Guide for KYC Edge Function

## 🚀 Production Deployment Setup

This guide explains how to configure and deploy the production-ready KYC edge function.

## 📋 Required Environment Variables

### 1. **Supabase Configuration (Required)**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. **CAMS KRA API Configuration (Primary Provider)**
```bash
CAMS_API_KEY=your_cams_api_key_here
CAMS_API_SECRET=your_cams_api_secret_here
CAMS_API_URL=https://api.camskra.com/v1/kyc/verify
CAMS_CLIENT_ID=fund-flow-app
```

### 3. **NSDL API Configuration (Fallback Provider)**
```bash
NSDL_API_KEY=your_nsdl_api_key_here
NSDL_API_URL=https://api.nsdl.com/kyc/verify
```

### 4. **Karvy API Configuration (Optional Third Provider)**
```bash
KARVY_API_KEY=your_karvy_api_key_here
KARVY_API_URL=https://api.karvy.com/kyc/verify
```

### 5. **Rate Limiting Configuration**
```bash
MAX_REQUESTS_PER_MINUTE=100
MAX_REQUESTS_PER_HOUR=1000
```

### 6. **Logging Configuration**
```bash
LOG_LEVEL=info
ENABLE_AUDIT_LOGGING=true
```

### 7. **Security Configuration**
```bash
ENABLE_IP_WHITELISTING=false
ALLOWED_ORIGINS=*
```

## 🔧 Setting Up Environment Variables

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Find your `kyc-verify` function
4. Click **Edit** and add environment variables

### Option 2: CLI Configuration
```bash
# Set environment variables via Supabase CLI
supabase secrets set CAMS_API_KEY=your_key_here
supabase secrets set CAMS_API_SECRET=your_secret_here
supabase secrets set NSDL_API_KEY=your_nsdl_key_here
```

### Option 3: Environment File
Create a `.env.local` file in your project root:
```bash
# Copy the example above and fill in your values
cp .env.production.example .env.local
# Edit .env.local with your actual values
```

## 🌐 KYC Provider Registration

### 1. **CAMS KRA Registration**
- **Website**: https://www.camsonline.com/
- **Contact**: Business Development Team
- **Process**: 
  1. Fill out application form
  2. Provide business details
  3. Sign agreement
  4. Receive API credentials
- **Timeline**: 2-4 weeks
- **Cost**: Setup fee + per verification charges

### 2. **NSDL Registration**
- **Website**: https://www.nsdl.co.in/
- **Contact**: API Services Team
- **Process**:
  1. Submit business proposal
  2. Technical evaluation
  3. Agreement signing
  4. API access provision
- **Timeline**: 3-6 weeks
- **Cost**: Annual subscription + usage charges

### 3. **Karvy Registration**
- **Website**: https://www.karvy.com/
- **Contact**: Digital Services Team
- **Process**:
  1. Business requirement discussion
  2. Technical integration planning
  3. Agreement execution
  4. API credentials delivery
- **Timeline**: 2-3 weeks
- **Cost**: Setup fee + per transaction charges

## 🔐 Security Best Practices

### 1. **API Key Management**
```bash
# Rotate keys regularly (monthly/quarterly)
# Use different keys for different environments
# Never commit keys to version control
```

### 2. **Rate Limiting**
```typescript
// Implement rate limiting in your application
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
};
```

### 3. **IP Whitelisting**
```bash
# If supported by your KYC provider
ENABLE_IP_WHITELISTING=true
ALLOWED_IPS=192.168.1.1,10.0.0.1
```

### 4. **HTTPS Only**
```typescript
// Ensure all API calls use HTTPS
const apiUrl = 'https://api.camskra.com/v1/kyc/verify';
```

## 📊 Monitoring & Alerts

### 1. **Key Metrics to Monitor**
- API response times
- Success/failure rates
- Cost per verification
- Database hit rates
- Error rates by provider

### 2. **Alert Thresholds**
```bash
# Set up alerts for:
ERROR_RATE_THRESHOLD=5%        # Alert if error rate > 5%
RESPONSE_TIME_THRESHOLD=5000ms # Alert if response time > 5s
COST_THRESHOLD=1000            # Alert if daily cost > ₹1000
```

### 3. **Logging Configuration**
```typescript
// Structured logging for production
console.log('KYC verification', {
  panNumber: maskedPan,
  provider: 'CAMS KRA',
  status: 'completed',
  responseTime: responseTime,
  timestamp: new Date().toISOString(),
  requestId: requestId
});
```

## 🧪 Testing in Production

### 1. **Sandbox Testing**
```bash
# Test with sandbox credentials first
CAMS_API_URL=https://sandbox-api.camskra.com/v1/kyc/verify
CAMS_API_KEY=sandbox_key_here
CAMS_API_SECRET=sandbox_secret_here
```

### 2. **Test PAN Numbers**
```typescript
// Use test PANs provided by KYC providers
const testPANs = [
  'TEST1234567', // CAMS test PAN
  'DEMO1234567', // NSDL test PAN
  'SAMPLE12345'  // Karvy test PAN
];
```

### 3. **Load Testing**
```bash
# Test with realistic load
ab -n 1000 -c 10 -p test_payload.json \
  -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-project.supabase.co/functions/v1/kyc-verify
```

## 🚀 Deployment Steps

### 1. **Pre-deployment Checklist**
- [ ] Environment variables configured
- [ ] KYC provider credentials received
- [ ] Sandbox testing completed
- [ ] Rate limiting configured
- [ ] Monitoring setup ready

### 2. **Deploy to Staging**
```bash
# Deploy to staging environment first
supabase functions deploy kyc-verify --env-file .env.staging
```

### 3. **Production Deployment**
```bash
# Deploy to production
supabase functions deploy kyc-verify --env-file .env.production
```

### 4. **Post-deployment Verification**
```bash
# Test with real PAN numbers
curl -X POST https://your-project.supabase.co/functions/v1/kyc-verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"panNumber": "REALPAN123"}'
```

## 💰 Cost Optimization

### 1. **Provider Selection Strategy**
```typescript
// Primary: CAMS KRA (comprehensive coverage)
// Fallback: NSDL (lower cost for securities)
// Tertiary: Karvy (specialized financial services)
```

### 2. **Batch Processing**
```typescript
// Process multiple PANs together for bulk discounts
const batchPANs = ['PAN1', 'PAN2', 'PAN3', 'PAN4'];
const batchResult = await verifyKYCBatch(batchPANs);
```

### 3. **Caching Strategy**
```typescript
// Cache results to avoid repeated API calls
const cacheKey = `kyc_${panNumber}`;
const cachedResult = await redis.get(cacheKey);
if (cachedResult) return JSON.parse(cachedResult);
```

## 🔍 Troubleshooting

### 1. **Common Issues**
```bash
# API key expired
Error: CAMS API error: 401 - Unauthorized
Solution: Rotate API keys

# Rate limit exceeded
Error: Rate limit exceeded
Solution: Implement exponential backoff

# Provider service down
Error: Connection timeout
Solution: Use fallback provider
```

### 2. **Debug Mode**
```typescript
// Enable debug logging in production
const DEBUG_MODE = Deno.env.get('DEBUG_MODE') === 'true';
if (DEBUG_MODE) {
  console.log('Debug info:', { requestPayload, response });
}
```

### 3. **Health Checks**
```typescript
// Implement health check endpoint
if (req.url.includes('/health')) {
  return new Response(JSON.stringify({
    status: 'healthy',
    providers: ['CAMS KRA', 'NSDL'],
    timestamp: new Date().toISOString()
  }));
}
```

## 📈 Performance Optimization

### 1. **Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX idx_kyc_pan_number ON kyc_details(pan_number);
CREATE INDEX idx_kyc_verification_status ON kyc_details(verification_status);
CREATE INDEX idx_kyc_created_at ON kyc_details(created_at);
```

### 2. **Connection Pooling**
```typescript
// Use connection pooling for database connections
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. **Response Caching**
```typescript
// Cache successful responses
const cacheResponse = (panNumber: string, result: KYCResponse) => {
  redis.setex(`kyc_cache_${panNumber}`, 3600, JSON.stringify(result));
};
```

## 🔄 Maintenance & Updates

### 1. **Regular Tasks**
- [ ] Monitor API usage and costs
- [ ] Review error logs and fix issues
- [ ] Update API credentials if needed
- [ ] Check provider service status
- [ ] Review performance metrics

### 2. **Update Schedule**
```bash
# Monthly: Review costs and usage
# Quarterly: Rotate API keys
# Semi-annually: Evaluate provider performance
# Annually: Review and update agreements
```

This production configuration ensures your KYC edge function is secure, scalable, and cost-effective while providing reliable KYC verification services.
