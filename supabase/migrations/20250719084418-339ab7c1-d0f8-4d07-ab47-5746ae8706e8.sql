-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(15),
  date_of_birth DATE,
  gender VARCHAR(10),
  
  -- KYC Status
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_progress', 'completed', 'rejected')),
  kyc_completed_at TIMESTAMP,
  
  -- Risk Profile
  risk_profile_status VARCHAR(20) DEFAULT 'pending' CHECK (risk_profile_status IN ('pending', 'completed')),
  risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
  risk_category VARCHAR(20) CHECK (risk_category IN ('conservative', 'moderate', 'aggressive')),
  
  -- Account Status
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (id)
);

-- Create KYC details table
CREATE TABLE public.kyc_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- PAN Details
  pan_number VARCHAR(10) UNIQUE,
  pan_verified BOOLEAN DEFAULT FALSE,
  pan_verified_at TIMESTAMP,
  
  -- Aadhaar Details
  aadhaar_number VARCHAR(12) UNIQUE,
  aadhaar_verified BOOLEAN DEFAULT FALSE,
  aadhaar_verified_at TIMESTAMP,
  
  -- Address Details
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  pincode VARCHAR(6),
  country VARCHAR(50) DEFAULT 'India',
  
  -- Bank Details
  bank_account_number VARCHAR(20),
  bank_ifsc_code VARCHAR(11),
  bank_name VARCHAR(100),
  bank_verified BOOLEAN DEFAULT FALSE,
  bank_verified_at TIMESTAMP,
  
  -- Document URLs (stored in Supabase Storage)
  pan_document_url VARCHAR(500),
  aadhaar_document_url VARCHAR(500),
  bank_statement_url VARCHAR(500),
  
  -- Verification Status
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'approved', 'rejected')),
  rejection_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create mutual fund schemes table
CREATE TABLE public.mutual_fund_schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_code VARCHAR(20) UNIQUE NOT NULL,
  scheme_name VARCHAR(255) NOT NULL,
  amc_name VARCHAR(100) NOT NULL,
  
  -- Fund Details
  fund_category VARCHAR(50) CHECK (fund_category IN ('equity', 'debt', 'hybrid', 'solution_oriented', 'other')),
  fund_subcategory VARCHAR(100),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'low_to_moderate', 'moderate', 'moderately_high', 'high')),
  
  -- Financial Details
  current_nav DECIMAL(10,4),
  minimum_sip_amount INTEGER DEFAULT 500,
  minimum_lumpsum_amount INTEGER DEFAULT 5000,
  expense_ratio DECIMAL(5,3),
  aum DECIMAL(15,2), -- Assets Under Management in crores
  
  -- Performance Data
  return_1day DECIMAL(8,4),
  return_1week DECIMAL(8,4),
  return_1month DECIMAL(8,4),
  return_3month DECIMAL(8,4),
  return_6month DECIMAL(8,4),
  return_1year DECIMAL(8,4),
  return_3year DECIMAL(8,4),
  return_5year DECIMAL(8,4),
  
  -- Fund Manager
  fund_manager_name VARCHAR(255),
  fund_manager_experience INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  launch_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create NAV history table
CREATE TABLE public.nav_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE CASCADE,
  nav_date DATE NOT NULL,
  nav_value DECIMAL(10,4) NOT NULL,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(scheme_id, nav_date)
);

-- Create user portfolios table
CREATE TABLE public.portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE RESTRICT,
  
  -- Investment Details
  total_units DECIMAL(15,4) DEFAULT 0,
  total_invested_amount DECIMAL(15,2) DEFAULT 0,
  average_nav DECIMAL(10,4),
  current_value DECIMAL(15,2) DEFAULT 0,
  
  -- Gains/Losses
  unrealized_gain_loss DECIMAL(15,2) DEFAULT 0,
  realized_gain_loss DECIMAL(15,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, scheme_id)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE RESTRICT,
  
  -- Transaction Details
  transaction_type VARCHAR(20) CHECK (transaction_type IN ('buy', 'sell', 'sip', 'dividend')),
  transaction_mode VARCHAR(20) CHECK (transaction_mode IN ('lumpsum', 'sip', 'switch', 'redemption')),
  
  -- Financial Details
  amount DECIMAL(15,2) NOT NULL,
  nav DECIMAL(10,4),
  units DECIMAL(15,4),
  
  -- SIP Details (if applicable)
  sip_id UUID, -- References sips table
  
  -- Transaction Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
  
  -- External References
  order_id VARCHAR(50) UNIQUE,
  payment_id VARCHAR(50),
  
  -- Dates
  transaction_date DATE DEFAULT CURRENT_DATE,
  settlement_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create SIPs management table
CREATE TABLE public.sips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE RESTRICT,
  
  -- SIP Configuration
  monthly_amount DECIMAL(10,2) NOT NULL,
  sip_date INTEGER CHECK (sip_date BETWEEN 1 AND 28), -- Day of month
  
  -- Duration
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for perpetual SIP
  total_installments INTEGER, -- NULL for perpetual
  completed_installments INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped', 'completed')),
  
  -- Auto-debit Details
  bank_account_id UUID, -- Reference to user's bank account
  mandate_id VARCHAR(50),
  
  -- Modification History
  original_amount DECIMAL(10,2), -- For tracking modifications
  modification_date DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create risk assessments table
CREATE TABLE public.risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Assessment Data
  assessment_version INTEGER DEFAULT 1,
  responses JSONB NOT NULL, -- Store all questionnaire responses
  
  -- Calculated Scores
  risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
  risk_category VARCHAR(20) CHECK (risk_category IN ('conservative', 'moderate', 'aggressive')),
  
  -- Recommendations
  recommended_equity_allocation INTEGER CHECK (recommended_equity_allocation BETWEEN 0 AND 100),
  recommended_debt_allocation INTEGER CHECK (recommended_debt_allocation BETWEEN 0 AND 100),
  recommended_gold_allocation INTEGER CHECK (recommended_gold_allocation BETWEEN 0 AND 100),
  
  -- Validity
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create watchlists table
CREATE TABLE public.watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE CASCADE,
  
  -- Alert Settings
  price_alert_enabled BOOLEAN DEFAULT FALSE,
  target_nav DECIMAL(10,4),
  alert_threshold_percentage DECIMAL(5,2), -- Alert when NAV changes by this %
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, scheme_id)
);

-- Create investment goals table
CREATE TABLE public.investment_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  
  -- Goal Details
  goal_name VARCHAR(255) NOT NULL,
  goal_type VARCHAR(50) CHECK (goal_type IN ('retirement', 'child_education', 'house_purchase', 'car', 'wedding', 'emergency_fund', 'other')),
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  
  -- Timeline
  target_date DATE NOT NULL,
  
  -- Calculations
  required_monthly_sip DECIMAL(10,2),
  required_lumpsum DECIMAL(15,2),
  expected_return_rate DECIMAL(5,2), -- Expected annual return
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused', 'cancelled')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create dividend history table
CREATE TABLE public.dividend_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE RESTRICT,
  
  -- Dividend Details
  record_date DATE NOT NULL,
  payment_date DATE,
  dividend_per_unit DECIMAL(10,4),
  units_held DECIMAL(15,4),
  total_dividend DECIMAL(15,2),
  
  -- Tax Details
  tds_deducted DECIMAL(15,2) DEFAULT 0,
  net_dividend DECIMAL(15,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'declared' CHECK (status IN ('declared', 'paid')),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create capital gains table
CREATE TABLE public.capital_gains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  scheme_id UUID REFERENCES public.mutual_fund_schemes(id) ON DELETE RESTRICT,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  
  -- Gain Details
  purchase_date DATE NOT NULL,
  sale_date DATE NOT NULL,
  purchase_nav DECIMAL(10,4),
  sale_nav DECIMAL(10,4),
  units_sold DECIMAL(15,4),
  
  -- Financial Calculations
  purchase_value DECIMAL(15,2),
  sale_value DECIMAL(15,2),
  gain_loss DECIMAL(15,2),
  
  -- Tax Classification
  gain_type VARCHAR(10) CHECK (gain_type IN ('STCG', 'LTCG')), -- Short-term or Long-term
  holding_period INTEGER, -- Days held
  
  -- Tax Calculation
  tax_rate DECIMAL(5,2),
  tax_amount DECIMAL(15,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividend_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_gains ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for kyc_details
CREATE POLICY "Users can view own KYC details" ON public.kyc_details
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own KYC details" ON public.kyc_details
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own KYC details" ON public.kyc_details
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for portfolios
CREATE POLICY "Users can view own portfolio" ON public.portfolios
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for SIPs
CREATE POLICY "Users can view own SIPs" ON public.sips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own SIPs" ON public.sips
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for other user-specific tables
CREATE POLICY "Users can manage own risk assessments" ON public.risk_assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlists" ON public.watchlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own investment goals" ON public.investment_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own dividend history" ON public.dividend_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own capital gains" ON public.capital_gains
  FOR SELECT USING (auth.uid() = user_id);

-- Mutual fund schemes are public for viewing
CREATE POLICY "Public read access for mutual fund schemes" ON public.mutual_fund_schemes
  FOR SELECT USING (true);

CREATE POLICY "Public read access for NAV history" ON public.nav_history
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_kyc_status ON public.user_profiles(kyc_status);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_kyc_pan_number ON public.kyc_details(pan_number);
CREATE INDEX idx_kyc_user_id ON public.kyc_details(user_id);
CREATE INDEX idx_schemes_category ON public.mutual_fund_schemes(fund_category);
CREATE INDEX idx_schemes_amc ON public.mutual_fund_schemes(amc_name);
CREATE INDEX idx_schemes_active ON public.mutual_fund_schemes(is_active);
CREATE INDEX idx_nav_history_date ON public.nav_history(nav_date DESC);
CREATE INDEX idx_nav_history_scheme_date ON public.nav_history(scheme_id, nav_date DESC);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolios_active ON public.portfolios(user_id, is_active);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_scheme_id ON public.transactions(scheme_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_sips_user_id ON public.sips(user_id);
CREATE INDEX idx_sips_status ON public.sips(status);
CREATE INDEX idx_sips_next_due ON public.sips(sip_date) WHERE status = 'active';
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_goals_user_id ON public.investment_goals(user_id);
CREATE INDEX idx_goals_status ON public.investment_goals(status);
CREATE INDEX idx_dividends_user_id ON public.dividend_history(user_id);
CREATE INDEX idx_dividends_payment_date ON public.dividend_history(payment_date DESC);
CREATE INDEX idx_capital_gains_user_id ON public.capital_gains(user_id);
CREATE INDEX idx_capital_gains_sale_date ON public.capital_gains(sale_date DESC);

-- Ensure only one active risk assessment per user
CREATE UNIQUE INDEX idx_risk_assessment_user_active ON public.risk_assessments(user_id) WHERE is_active = TRUE;

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    created_at,
    kyc_status,
    risk_profile_status
  )
  VALUES (
    new.id,
    new.email,
    new.created_at,
    'pending',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_details_updated_at
  BEFORE UPDATE ON public.kyc_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sips_updated_at
  BEFORE UPDATE ON public.sips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investment_goals_updated_at
  BEFORE UPDATE ON public.investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create portfolio calculation function
CREATE OR REPLACE FUNCTION public.calculate_portfolio_value(user_uuid UUID)
RETURNS TABLE (
  total_invested DECIMAL,
  current_value DECIMAL,
  total_gains DECIMAL,
  percentage_gain DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(p.total_invested_amount), 0) as total_invested,
    COALESCE(SUM(p.total_units * mfs.current_nav), 0) as current_value,
    COALESCE(SUM(p.total_units * mfs.current_nav) - SUM(p.total_invested_amount), 0) as total_gains,
    CASE 
      WHEN SUM(p.total_invested_amount) > 0 
      THEN ((SUM(p.total_units * mfs.current_nav) - SUM(p.total_invested_amount)) / SUM(p.total_invested_amount)) * 100
      ELSE 0
    END as percentage_gain
  FROM public.portfolios p
  JOIN public.mutual_fund_schemes mfs ON p.scheme_id = mfs.id
  WHERE p.user_id = user_uuid AND p.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create SIP calculator function
CREATE OR REPLACE FUNCTION public.calculate_sip(
  monthly_amount DECIMAL,
  annual_return_rate DECIMAL,
  investment_years INTEGER
)
RETURNS TABLE (
  total_invested DECIMAL,
  maturity_value DECIMAL,
  wealth_gained DECIMAL
) AS $$
DECLARE
  monthly_rate DECIMAL;
  total_months INTEGER;
BEGIN
  monthly_rate := annual_return_rate / 100 / 12;
  total_months := investment_years * 12;
  
  RETURN QUERY
  SELECT 
    monthly_amount * total_months as total_invested,
    CASE 
      WHEN monthly_rate > 0 THEN
        monthly_amount * (POWER(1 + monthly_rate, total_months) - 1) / monthly_rate * (1 + monthly_rate)
      ELSE 
        monthly_amount * total_months
    END as maturity_value,
    CASE 
      WHEN monthly_rate > 0 THEN
        (monthly_amount * (POWER(1 + monthly_rate, total_months) - 1) / monthly_rate * (1 + monthly_rate)) - (monthly_amount * total_months)
      ELSE 
        0
    END as wealth_gained;
END;
$$ LANGUAGE plpgsql;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('kyc-documents', 'kyc-documents', false, 10485760, '{"image/jpeg","image/png","application/pdf"}'),
  ('profile-images', 'profile-images', false, 5242880, '{"image/jpeg","image/png"}'),
  ('fund-documents', 'fund-documents', true, 52428800, '{"application/pdf","image/jpeg","image/png"}');

-- Create storage policies for KYC documents
CREATE POLICY "Users can upload their KYC documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'kyc-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own KYC documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'kyc-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create storage policies for profile images
CREATE POLICY "Users can upload their profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public access for fund documents
CREATE POLICY "Public read access for fund documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'fund-documents');

-- Enable realtime for real-time updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sips;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mutual_fund_schemes;