export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      capital_gains: {
        Row: {
          created_at: string | null
          gain_loss: number | null
          gain_type: string | null
          holding_period: number | null
          id: string
          purchase_date: string
          purchase_nav: number | null
          purchase_value: number | null
          sale_date: string
          sale_nav: number | null
          sale_value: number | null
          scheme_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          transaction_id: string | null
          units_sold: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gain_loss?: number | null
          gain_type?: string | null
          holding_period?: number | null
          id?: string
          purchase_date: string
          purchase_nav?: number | null
          purchase_value?: number | null
          sale_date: string
          sale_nav?: number | null
          sale_value?: number | null
          scheme_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          transaction_id?: string | null
          units_sold?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gain_loss?: number | null
          gain_type?: string | null
          holding_period?: number | null
          id?: string
          purchase_date?: string
          purchase_nav?: number | null
          purchase_value?: number | null
          sale_date?: string
          sale_nav?: number | null
          sale_value?: number | null
          scheme_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          transaction_id?: string | null
          units_sold?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capital_gains_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capital_gains_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capital_gains_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dividend_history: {
        Row: {
          created_at: string | null
          dividend_per_unit: number | null
          id: string
          net_dividend: number | null
          payment_date: string | null
          record_date: string
          scheme_id: string | null
          status: string | null
          tds_deducted: number | null
          total_dividend: number | null
          units_held: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dividend_per_unit?: number | null
          id?: string
          net_dividend?: number | null
          payment_date?: string | null
          record_date: string
          scheme_id?: string | null
          status?: string | null
          tds_deducted?: number | null
          total_dividend?: number | null
          units_held?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dividend_per_unit?: number | null
          id?: string
          net_dividend?: number | null
          payment_date?: string | null
          record_date?: string
          scheme_id?: string | null
          status?: string | null
          tds_deducted?: number | null
          total_dividend?: number | null
          units_held?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dividend_history_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dividend_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_access_log: {
        Row: {
          access_type: string
          accessed_at: string
          bucket_name: string
          document_type: string
          expires_at: string | null
          file_path: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type?: string
          accessed_at?: string
          bucket_name: string
          document_type: string
          expires_at?: string | null
          file_path: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          bucket_name?: string
          document_type?: string
          expires_at?: string | null
          file_path?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          expected_return_rate: number | null
          goal_name: string
          goal_type: string | null
          id: string
          required_lumpsum: number | null
          required_monthly_sip: number | null
          status: string | null
          target_amount: number
          target_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          expected_return_rate?: number | null
          goal_name: string
          goal_type?: string | null
          id?: string
          required_lumpsum?: number | null
          required_monthly_sip?: number | null
          status?: string | null
          target_amount: number
          target_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          expected_return_rate?: number | null
          goal_name?: string
          goal_type?: string | null
          id?: string
          required_lumpsum?: number | null
          required_monthly_sip?: number | null
          status?: string | null
          target_amount?: number
          target_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_audit_log: {
        Row: {
          accessed_at: string | null
          action: string
          details: Json | null
          id: string
          ip_address: unknown | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          action: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          table_name?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          action?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kyc_details: {
        Row: {
          aadhaar_document_url: string | null
          aadhaar_number: string | null
          aadhaar_verified: boolean | null
          aadhaar_verified_at: string | null
          address_line1: string | null
          address_line2: string | null
          bank_account_number: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          bank_statement_url: string | null
          bank_verified: boolean | null
          bank_verified_at: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          pan_document_url: string | null
          pan_number: string | null
          pan_verified: boolean | null
          pan_verified_at: string | null
          pincode: string | null
          rejection_reason: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          aadhaar_document_url?: string | null
          aadhaar_number?: string | null
          aadhaar_verified?: boolean | null
          aadhaar_verified_at?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          bank_statement_url?: string | null
          bank_verified?: boolean | null
          bank_verified_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          pan_document_url?: string | null
          pan_number?: string | null
          pan_verified?: boolean | null
          pan_verified_at?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          aadhaar_document_url?: string | null
          aadhaar_number?: string | null
          aadhaar_verified?: boolean | null
          aadhaar_verified_at?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          bank_statement_url?: string | null
          bank_verified?: boolean | null
          bank_verified_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          pan_document_url?: string | null
          pan_number?: string | null
          pan_verified?: boolean | null
          pan_verified_at?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_display_cache: {
        Row: {
          aadhaar_number_masked: string | null
          aadhaar_verified: boolean | null
          address_line1: string | null
          address_line2: string | null
          bank_account_number_masked: string | null
          bank_ifsc_code: string | null
          bank_name: string | null
          bank_verified: boolean | null
          cache_updated_at: string | null
          city: string | null
          country: string | null
          created_at: string | null
          id: string
          pan_number_masked: string | null
          pan_verified: boolean | null
          pincode: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          aadhaar_number_masked?: string | null
          aadhaar_verified?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number_masked?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          cache_updated_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          pan_number_masked?: string | null
          pan_verified?: boolean | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          aadhaar_number_masked?: string | null
          aadhaar_verified?: boolean | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account_number_masked?: string | null
          bank_ifsc_code?: string | null
          bank_name?: string | null
          bank_verified?: boolean | null
          cache_updated_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          pan_number_masked?: string | null
          pan_verified?: boolean | null
          pincode?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      mutual_fund_schemes: {
        Row: {
          amc_name: string
          aum: number | null
          created_at: string | null
          current_nav: number | null
          expense_ratio: number | null
          fund_category: string | null
          fund_manager_experience: number | null
          fund_manager_name: string | null
          fund_subcategory: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          minimum_lumpsum_amount: number | null
          minimum_sip_amount: number | null
          return_1day: number | null
          return_1month: number | null
          return_1week: number | null
          return_1year: number | null
          return_3month: number | null
          return_3year: number | null
          return_5year: number | null
          return_6month: number | null
          risk_level: string | null
          scheme_code: string
          scheme_name: string
          updated_at: string | null
        }
        Insert: {
          amc_name: string
          aum?: number | null
          created_at?: string | null
          current_nav?: number | null
          expense_ratio?: number | null
          fund_category?: string | null
          fund_manager_experience?: number | null
          fund_manager_name?: string | null
          fund_subcategory?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          minimum_lumpsum_amount?: number | null
          minimum_sip_amount?: number | null
          return_1day?: number | null
          return_1month?: number | null
          return_1week?: number | null
          return_1year?: number | null
          return_3month?: number | null
          return_3year?: number | null
          return_5year?: number | null
          return_6month?: number | null
          risk_level?: string | null
          scheme_code: string
          scheme_name: string
          updated_at?: string | null
        }
        Update: {
          amc_name?: string
          aum?: number | null
          created_at?: string | null
          current_nav?: number | null
          expense_ratio?: number | null
          fund_category?: string | null
          fund_manager_experience?: number | null
          fund_manager_name?: string | null
          fund_subcategory?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          minimum_lumpsum_amount?: number | null
          minimum_sip_amount?: number | null
          return_1day?: number | null
          return_1month?: number | null
          return_1week?: number | null
          return_1year?: number | null
          return_3month?: number | null
          return_3year?: number | null
          return_5year?: number | null
          return_6month?: number | null
          risk_level?: string | null
          scheme_code?: string
          scheme_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nav_history: {
        Row: {
          created_at: string | null
          id: string
          nav_date: string
          nav_value: number
          scheme_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nav_date: string
          nav_value: number
          scheme_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nav_date?: string
          nav_value?: number
          scheme_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nav_history_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          average_nav: number | null
          created_at: string | null
          current_value: number | null
          id: string
          is_active: boolean | null
          realized_gain_loss: number | null
          scheme_id: string | null
          total_invested_amount: number | null
          total_units: number | null
          unrealized_gain_loss: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_nav?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          realized_gain_loss?: number | null
          scheme_id?: string | null
          total_invested_amount?: number | null
          total_units?: number | null
          unrealized_gain_loss?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_nav?: number | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          is_active?: boolean | null
          realized_gain_loss?: number | null
          scheme_id?: string | null
          total_invested_amount?: number | null
          total_units?: number | null
          unrealized_gain_loss?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessment_version: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          recommended_debt_allocation: number | null
          recommended_equity_allocation: number | null
          recommended_gold_allocation: number | null
          responses: Json
          risk_category: string | null
          risk_score: number | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          assessment_version?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recommended_debt_allocation?: number | null
          recommended_equity_allocation?: number | null
          recommended_gold_allocation?: number | null
          responses: Json
          risk_category?: string | null
          risk_score?: number | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          assessment_version?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          recommended_debt_allocation?: number | null
          recommended_equity_allocation?: number | null
          recommended_gold_allocation?: number | null
          responses?: Json
          risk_category?: string | null
          risk_score?: number | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sips: {
        Row: {
          bank_account_id: string | null
          completed_installments: number | null
          created_at: string | null
          end_date: string | null
          id: string
          mandate_id: string | null
          modification_date: string | null
          monthly_amount: number
          original_amount: number | null
          scheme_id: string | null
          sip_date: number | null
          start_date: string
          status: string | null
          total_installments: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account_id?: string | null
          completed_installments?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          mandate_id?: string | null
          modification_date?: string | null
          monthly_amount: number
          original_amount?: number | null
          scheme_id?: string | null
          sip_date?: number | null
          start_date: string
          status?: string | null
          total_installments?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account_id?: string | null
          completed_installments?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          mandate_id?: string | null
          modification_date?: string | null
          monthly_amount?: number
          original_amount?: number | null
          scheme_id?: string | null
          sip_date?: number | null
          start_date?: string
          status?: string | null
          total_installments?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sips_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          nav: number | null
          order_id: string | null
          payment_id: string | null
          scheme_id: string | null
          settlement_date: string | null
          sip_id: string | null
          status: string | null
          transaction_date: string | null
          transaction_mode: string | null
          transaction_type: string | null
          units: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          nav?: number | null
          order_id?: string | null
          payment_id?: string | null
          scheme_id?: string | null
          settlement_date?: string | null
          sip_id?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_mode?: string | null
          transaction_type?: string | null
          units?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          nav?: number | null
          order_id?: string | null
          payment_id?: string | null
          scheme_id?: string | null
          settlement_date?: string | null
          sip_id?: string | null
          status?: string | null
          transaction_date?: string | null
          transaction_mode?: string | null
          transaction_type?: string | null
          units?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "mutual_fund_schemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_status: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          kyc_completed_at: string | null
          kyc_status: string | null
          onboarding_status: string | null
          phone: string | null
          risk_category: string | null
          risk_profile: string | null
          risk_profile_status: string | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          kyc_completed_at?: string | null
          kyc_status?: string | null
          onboarding_status?: string | null
          phone?: string | null
          risk_category?: string | null
          risk_profile?: string | null
          risk_profile_status?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          kyc_completed_at?: string | null
          kyc_status?: string | null
          onboarding_status?: string | null
          phone?: string | null
          risk_category?: string | null
          risk_profile?: string | null
          risk_profile_status?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          alert_threshold_percentage: number | null
          created_at: string | null
          id: string
          price_alert_enabled: boolean | null
          scheme_codes: string[] | null
          target_nav: number | null
          user_id: string
        }
        Insert: {
          alert_threshold_percentage?: number | null
          created_at?: string | null
          id?: string
          price_alert_enabled?: boolean | null
          scheme_codes?: string[] | null
          target_nav?: number | null
          user_id: string
        }
        Update: {
          alert_threshold_percentage?: number | null
          created_at?: string | null
          id?: string
          price_alert_enabled?: boolean | null
          scheme_codes?: string[] | null
          target_nav?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_portfolio_value: {
        Args: { user_uuid: string }
        Returns: {
          current_value: number
          percentage_gain: number
          total_gains: number
          total_invested: number
        }[]
      }
      calculate_sip: {
        Args: {
          annual_return_rate: number
          investment_years: number
          monthly_amount: number
        }
        Returns: {
          maturity_value: number
          total_invested: number
          wealth_gained: number
        }[]
      }
      check_rate_limit_enhanced: {
        Args: {
          action_input: string
          identifier_input: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      get_kyc_details_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          aadhaar_number: string
          aadhaar_verified: boolean
          address_line1: string
          address_line2: string
          bank_account_number: string
          bank_ifsc_code: string
          bank_name: string
          bank_verified: boolean
          city: string
          country: string
          created_at: string
          id: string
          pan_number: string
          pan_verified: boolean
          pincode: string
          state: string
          updated_at: string
          user_id: string
          verification_status: string
        }[]
      }
      get_secure_document_url: {
        Args: { bucket_name: string; expires_in?: number; file_path: string }
        Returns: string
      }
      mask_sensitive_data: {
        Args: { data_type: string; value: string }
        Returns: string
      }
      mask_sensitive_data_enhanced: {
        Args: { data_type: string; user_salt?: string; value: string }
        Returns: string
      }
      refresh_kyc_display_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_kyc_details_secure: {
        Args: {
          p_aadhaar_number?: string
          p_address_line1?: string
          p_address_line2?: string
          p_bank_account_number?: string
          p_bank_ifsc_code?: string
          p_bank_name?: string
          p_city?: string
          p_country?: string
          p_pan_number?: string
          p_pincode?: string
          p_state?: string
        }
        Returns: string
      }
      validate_aadhaar_number: {
        Args: { aadhaar_input: string }
        Returns: boolean
      }
      validate_pan_number: {
        Args: { pan_input: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
