import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import PopulateFundSchemes from '@/components/PopulateFundSchemes';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Utilities
            </CardTitle>
            <CardDescription>
              Administrative tools for managing the mutual fund data and system operations.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6">
          <PopulateFundSchemes />
        </div>
      </div>
    </div>
  );
};

export default Admin;