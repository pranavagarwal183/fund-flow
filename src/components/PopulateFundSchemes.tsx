import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface PopulationResult {
  fund_name: string;
  isin: string;
  status: 'success' | 'error';
  error?: string;
}

interface PopulationResponse {
  success: boolean;
  message: string;
  results: PopulationResult[];
  error?: string;
}

const PopulateFundSchemes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PopulationResponse | null>(null);

  const handlePopulate = async () => {
    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('populate-fund-schemes');

      if (error) {
        throw new Error(error.message);
      }

      setResults(data);
    } catch (error) {
      console.error('Error populating fund schemes:', error);
      setResults({
        success: false,
        message: 'Failed to populate fund schemes',
        results: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Populate Fund Schemes
        </CardTitle>
        <CardDescription>
          This will fetch detailed mutual fund information from the Gemini API for all funds in the ISIN data table 
          and populate the mutual_fund_schemes table. This process may take several minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handlePopulate}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Populating Fund Schemes...
            </>
          ) : (
            'Start Population Process'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            <Alert variant={results.success ? "default" : "destructive"}>
              <div className="flex items-center gap-2">
                {results.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {results.error || results.message}
                </AlertDescription>
              </div>
            </Alert>

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Processing Results:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`text-sm p-2 rounded ${
                        result.status === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <div className="font-medium">{result.fund_name}</div>
                      <div className="text-xs opacity-75">ISIN: {result.isin}</div>
                      {result.error && (
                        <div className="text-xs mt-1">Error: {result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PopulateFundSchemes;