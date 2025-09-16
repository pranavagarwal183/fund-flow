-- Add ISIN column to mutual_fund_schemes table for API integration
ALTER TABLE public.mutual_fund_schemes 
ADD COLUMN IF NOT EXISTS isin VARCHAR(12);

-- Add index for ISIN lookups
CREATE INDEX IF NOT EXISTS idx_mutual_fund_schemes_isin ON public.mutual_fund_schemes(isin);

-- Add comment for documentation
COMMENT ON COLUMN public.mutual_fund_schemes.isin IS 'ISIN (International Securities Identification Number) for API integration with external data sources';
