# KYC Verification Edge Function

## Overview
This edge function has been updated to check KYC details by PAN number only. It searches the database for existing KYC records and marks them as completed if found.

## Key Changes Made

### 1. Simplified Request Interface
- **Before**: Required both `panNumber` and `fullName`
- **After**: Only requires `panNumber`

### 2. Database Integration
- Connects to Supabase database using service role key
- Searches `kyc_details` table by PAN number
- Updates both `kyc_details` and `user_profiles` tables

### 3. KYC Status Management
- Automatically marks KYC as `completed` when PAN is found
- Updates `verification_status` to `approved` in `kyc_details`
- Updates `kyc_status` to `completed` in `user_profiles`
- Sets verification timestamps

## API Endpoint

**URL**: `https://your-project.supabase.co/functions/v1/kyc-verify`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY
```

**Request Body**:
```json
{
  "panNumber": "ABCDE1234F"
}
```

**Response Format**:
```json
{
  "status": "completed" | "not_found" | "error",
  "message": "Description of the result",
  "details": {
    "panNumber": "ABCDE1234F",
    "kycStatus": "completed",
    "verifiedAt": "2024-01-15T10:30:00.000Z",
    "userId": "user-uuid"
  }
}
```

## Response Statuses

### `completed`
- KYC verification was successful
- PAN number found in database
- KYC status updated to completed

### `not_found`
- PAN number not found in database
- No KYC records exist for this PAN

### `error`
- Server error occurred
- Database connection issues
- Invalid PAN format

## Environment Variables Required

The edge function requires these environment variables:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Tables Updated

### `kyc_details` Table
- `verification_status` → `approved`
- `pan_verified` → `true`
- `pan_verified_at` → Current timestamp
- `updated_at` → Current timestamp

### `user_profiles` Table
- `kyc_status` → `completed`
- `kyc_completed_at` → Current timestamp
- `updated_at` → Current timestamp

## Usage Examples

### JavaScript/TypeScript
```typescript
const verifyKYC = async (panNumber: string) => {
  const response = await fetch('/functions/v1/kyc-verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ panNumber })
  });
  
  const result = await response.json();
  return result;
};

// Usage
const result = await verifyKYC('ABCDE1234F');
console.log(result.status); // 'completed', 'not_found', or 'error'
```

### cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/kyc-verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"panNumber": "ABCDE1234F"}'
```

## Security Features

1. **PAN Format Validation**: Ensures PAN follows Indian PAN format (ABCDE1234F)
2. **Service Role Access**: Uses service role key for database operations
3. **Audit Logging**: Logs all verification attempts
4. **Error Handling**: Graceful error handling with detailed error messages

## Testing

Use the provided `test-kyc-function.html` file to test the edge function:

1. Open the HTML file in a browser
2. Enter a valid PAN number
3. Click "Verify KYC"
4. View the response

**Note**: Update the Supabase URL and anon key in the test file before using.

## Deployment

1. Ensure environment variables are set in Supabase dashboard
2. Deploy the edge function:
   ```bash
   supabase functions deploy kyc-verify
   ```
3. Test with a valid PAN number

## Error Handling

The function handles various error scenarios:
- Missing environment variables
- Database connection failures
- Invalid PAN format
- PAN not found in database
- Database update failures

All errors are logged for debugging and audit purposes.

## Future Enhancements

Potential improvements for production use:
1. Integration with actual CAMS KRA API
2. Rate limiting for API calls
3. Enhanced audit logging
4. Webhook notifications for KYC completion
5. Batch PAN verification support
