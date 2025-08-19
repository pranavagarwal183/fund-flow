import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Upload, FileText, User, Shield } from "lucide-react";
import { toast } from "sonner";

// Step 1 Schema - KYC Verification
const kycSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
});

// Step 2 Schema - Detailed Information
const detailsSchema = z.object({
  fathersName: z.string().min(2, "Father's name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountType: z.enum(["savings", "current"]),
  nomineeName: z.string().min(2, "Nominee name is required"),
  nomineeRelationship: z.string().min(2, "Relationship is required"),
  nomineeDob: z.string().min(1, "Nominee date of birth is required"),
});

type KYCFormData = z.infer<typeof kycSchema>;
type DetailsFormData = z.infer<typeof detailsSchema>;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<'pending' | 'checking' | 'approved' | 'rejected'>('pending');
  const [uploading, setUploading] = useState(false);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const { user } = useAuth();

  const kycForm = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      fullName: "",
      panNumber: "",
      mobileNumber: "",
      email: user?.email || "",
    },
  });

  const detailsForm = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      fathersName: "",
      dateOfBirth: "",
      gender: "male",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "savings",
      nomineeName: "",
      nomineeRelationship: "",
      nomineeDob: "",
    },
  });

  // Load existing user data if available
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        kycForm.setValue('fullName', profile.full_name || '');
        kycForm.setValue('email', profile.email || '');
        kycForm.setValue('mobileNumber', profile.phone || '');
      }
    };

    loadUserData();
  }, [user, kycForm]);

  const handleKYCSubmit = async (data: KYCFormData) => {
    setKycStatus('checking');
    
    try {
      // Call KYC verification API
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/kyc-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panNumber: data.panNumber,
          fullName: data.fullName,
        }),
      });

      const result = await response.json();

      if (result.status === 'approved') {
        setKycStatus('approved');
        toast.success('KYC verification successful!');
        
        // Update user profile
        await supabase
          .from('user_profiles')
          .upsert({
            id: user?.id,
            full_name: data.fullName,
            email: data.email,
            phone: data.mobileNumber,
            onboarding_status: 'KYC_APPROVED',
            updated_at: new Date().toISOString(),
          });

        // Move to next step
        setTimeout(() => setCurrentStep(2), 1000);
      } else {
        setKycStatus('rejected');
        toast.error('KYC verification failed. Please complete your KYC separately.');
      }
    } catch (error) {
      console.error('KYC verification error:', error);
      setKycStatus('rejected');
      toast.error('KYC verification failed. Please try again.');
    }
  };

  const handleFileUpload = async (file: File, type: 'pan' | 'aadhaar') => {
    if (!user) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file);

      if (error) throw error;

      return data.path;
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload failed. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDetailsSubmit = async (data: DetailsFormData) => {
    if (!user) return;

    setUploading(true);
    try {
      // Upload documents
      const panPath = panFile ? await handleFileUpload(panFile, 'pan') : null;
      const aadhaarPath = aadhaarFile ? await handleFileUpload(aadhaarFile, 'aadhaar') : null;

      if (!panPath || !aadhaarPath) {
        toast.error('Please upload both PAN and Aadhaar documents.');
        setUploading(false);
        return;
      }

      // Update KYC details
      await supabase
        .from('kyc_details')
        .upsert({
          user_id: user.id,
          pan_number: kycForm.getValues('panNumber'),
          pan_document_url: panPath,
          pan_verified: true,
          pan_verified_at: new Date().toISOString(),
          aadhaar_document_url: aadhaarPath,
          bank_name: data.bankName,
          bank_account_number: data.accountNumber,
          bank_ifsc_code: data.ifscCode,
          verification_status: 'pending_verification',
        });

      // Update user profile
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: kycForm.getValues('fullName'),
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          onboarding_status: 'COMPLETE',
          updated_at: new Date().toISOString(),
        });

      toast.success('Onboarding completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { id: 1, title: 'KYC Verification', icon: Shield },
    { id: 2, title: 'Account Setup', icon: User },
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to FundFlow
          </h1>
          <p className="text-gray-600">
            Let's get you started with your investment journey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Step 1: KYC Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...kycForm}>
                    <form onSubmit={kycForm.handleSubmit(handleKYCSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={kycForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={kycForm.control}
                          name="panNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="ABCDE1234F" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={kycForm.control}
                          name="mobileNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input placeholder="9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={kycForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {kycStatus === 'checking' && (
                        <Alert>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <AlertDescription>
                            Verifying your KYC status with CAMS KRA...
                          </AlertDescription>
                        </Alert>
                      )}

                      {kycStatus === 'rejected' && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            KYC verification failed. Please complete your KYC at{' '}
                            <a 
                              href="https://www.camskra.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              CAMS KRA portal
                            </a>
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={kycStatus === 'checking'}
                      >
                        {kycStatus === 'checking' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying KYC...
                          </>
                        ) : (
                          'Verify KYC & Continue'
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Step 2: Account Setup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...detailsForm}>
                    <form onSubmit={detailsForm.handleSubmit(handleDetailsSubmit)} className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={detailsForm.control}
                            name="fathersName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Father's/Spouse's Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter father's or spouse's name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Bank Account Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={detailsForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter bank name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter account number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="ifscCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IFSC Code</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="ABCD0001234" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="accountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="savings">Savings</SelectItem>
                                    <SelectItem value="current">Current</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Nominee Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Nominee Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={detailsForm.control}
                            name="nomineeName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nominee Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter nominee's full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="nomineeRelationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Spouse, Father, Son" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={detailsForm.control}
                            name="nomineeDob"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nominee Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Document Upload */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Document Upload</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>PAN Card (Signed)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="pan-upload"
                              />
                              <label htmlFor="pan-upload" className="cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {panFile ? panFile.name : 'Click to upload PAN card'}
                                </p>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Aadhaar Card (Signed)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="aadhaar-upload"
                              />
                              <label htmlFor="aadhaar-upload" className="cursor-pointer">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  {aadhaarFile ? aadhaarFile.name : 'Click to upload Aadhaar card'}
                                </p>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={uploading || !panFile || !aadhaarFile}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Completing Setup...
                            </>
                          ) : (
                            'Complete Setup'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
