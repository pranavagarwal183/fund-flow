-- Create fund data cache table for daily fund data storage
CREATE TABLE IF NOT EXISTS fund_data_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fund_id TEXT NOT NULL,
    fund_name TEXT NOT NULL,
    category TEXT,
    nav DECIMAL(10, 4),
    low_52_week DECIMAL(10, 4),
    high_52_week DECIMAL(10, 4),
    expense_ratio DECIMAL(5, 2),
    aum TEXT,
    risk_level TEXT,
    return_1y DECIMAL(5, 2),
    return_3y DECIMAL(5, 2),
    return_5y DECIMAL(5, 2),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    nav_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique fund entries per day
    UNIQUE(fund_id, nav_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_fund_data_cache_fund_id ON fund_data_cache(fund_id);
CREATE INDEX IF NOT EXISTS idx_fund_data_cache_nav_date ON fund_data_cache(nav_date);
CREATE INDEX IF NOT EXISTS idx_fund_data_cache_last_updated ON fund_data_cache(last_updated);
CREATE INDEX IF NOT EXISTS idx_fund_data_cache_category ON fund_data_cache(category);

-- Create a view for the latest fund data
CREATE OR REPLACE VIEW latest_fund_data AS
SELECT DISTINCT ON (fund_id)
    fund_id,
    fund_name,
    category,
    nav,
    low_52_week,
    high_52_week,
    expense_ratio,
    aum,
    risk_level,
    return_1y,
    return_3y,
    return_5y,
    rating,
    nav_date,
    last_updated
FROM fund_data_cache
ORDER BY fund_id, nav_date DESC, last_updated DESC;

-- Enable Row Level Security
ALTER TABLE fund_data_cache ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all users
CREATE POLICY "Allow read access to fund data cache" ON fund_data_cache
    FOR SELECT USING (true);

-- Create policy to allow service role to manage cache
CREATE POLICY "Allow service role to manage fund data cache" ON fund_data_cache
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to clean up old cache entries (keep only last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_fund_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM fund_data_cache 
    WHERE nav_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cleanup_old_fund_cache() TO service_role;

