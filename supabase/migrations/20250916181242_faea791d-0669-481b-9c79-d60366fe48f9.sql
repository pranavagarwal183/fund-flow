-- Fix Critical Security Issues: Make user_id columns NOT NULL

-- First, check and clean any existing NULL user_id records
DELETE FROM public.capital_gains WHERE user_id IS NULL;
DELETE FROM public.dividend_history WHERE user_id IS NULL;
DELETE FROM public.portfolios WHERE user_id IS NULL;

-- Make user_id columns NOT NULL for critical security
ALTER TABLE public.capital_gains 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.dividend_history 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.portfolios 
ALTER COLUMN user_id SET NOT NULL;

-- Add CHECK constraints to ensure user_id is valid UUID
ALTER TABLE public.capital_gains 
ADD CONSTRAINT capital_gains_user_id_valid CHECK (user_id IS NOT NULL);

ALTER TABLE public.dividend_history 
ADD CONSTRAINT dividend_history_user_id_valid CHECK (user_id IS NOT NULL);

ALTER TABLE public.portfolios 
ADD CONSTRAINT portfolios_user_id_valid CHECK (user_id IS NOT NULL);