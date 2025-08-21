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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Upload, FileText, User, Shield, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";

// Step 1 Schema - KYC Verification
const kycSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
});

// Step 2 Schema - CAN Registration
const canSchema = z.object({
  // Personal Details
  fathersName: z.string().min(2, "Father's name must be at least 2 characters"),
  mothersName: z.string().min(2, "Mother's name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  occupation: z.string().min(2, "Occupation is required"),
  
  // Contact & Address
  permanentAddress: z.string().min(10, "Permanent address is required"),
  correspondenceAddress: z.string().min(10, "Correspondence address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid pincode"),
  
  // Bank Account Details
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountType: z.enum(["savings", "current"]),
  
  // FATCA/CRS Declaration
  taxResidency: z.string().min(1, "Tax residency is required"),
  taxIdNumber: z.string().optional(),
  
  // Nominee Details
  nomineeName: z.string().min(2, "Nominee name is required"),
  nomineeRelationship: z.string().min(2, "Relationship is required"),
  nomineeDob: z.string().min(1, "Nominee date of birth is required"),
});

// Step 3 Schema - Mandate Registration  
const mandateSchema = z.object({
  bankAccount: z.string().min(10, "Bank account number is required"),
  maxAmount: z.string().min(1, "Maximum amount is required"),
  authMethod: z.enum(["netbanking", "debit_card"]),
  debitCardNumber: z.string().optional(),
  debitCardExpiry: z.string().optional(),
});

type KYCFormData = z.infer<typeof kycSchema>;
type CANFormData = z.infer<typeof canSchema>;
type MandateFormData = z.infer<typeof mandateSchema>;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycStatus, setKycStatus] = useState<'pending' | 'checking' | 'approved' | 'rejected'>('pending');
  const [uploading, setUploading] = useState(false);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const { user, userProfile } = useAuth();

  // Determine current step based on user's onboarding status
  useEffect(() => {
    if (!userProfile?.onboarding_status) return;
    
    switch (userProfile.onboarding_status) {
      case 'NEEDS_KYC':
        setCurrentStep(1);
        break;
      case 'NEEDS_CAN_REGISTRATION':
        setCurrentStep(2);
        break;
      case 'NEEDS_MANDATE':
        setCurrentStep(3);
        break;
      default:
        setCurrentStep(1);
    }
  }, [userProfile]);

  const kycForm = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      fullName: "",
      panNumber: "",
      mobileNumber: "",
      email: user?.email || "",
    },
  });

  const canForm = useForm<CANFormData>({
    resolver: zodResolver(canSchema),
    defaultValues: {
      fathersName: "",
      mothersName: "",
      dateOfBirth: "",
      gender: "male",
      occupation: "",
      permanentAddress: "",
      correspondenceAddress: "",
      city: "",
      state: "",
      pincode: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountType: "savings",
      taxResidency: "India",
      taxIdNumber: "",
      nomineeName: "",
      nomineeRelationship: "",
      nomineeDob: "",
    },
  });

  const mandateForm = useForm<MandateFormData>({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      bankAccount: "",
      maxAmount: "25000",
      authMethod: "netbanking",
      debitCardNumber: "",
      debitCardExpiry: "",
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
      // Call KYC verification function
      const { data: result, error } = await supabase.functions.invoke('kyc-verify', {
        body: {
          panNumber: data.panNumber,
          fullName: data.fullName,
        },
      });

      if (error) throw error;

      if (result.status === 'approved') {
        setKycStatus('approved');
        toast.success('KYC verification successful!');
        
        // Update user profile
        await supabase
          .from('user_profiles')
          .upsert({
            id: user?.id,
            email: data.email,
            full_name: data.fullName,
            phone: data.mobileNumber,
            onboarding_status: 'NEEDS_CAN_REGISTRATION',
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

  const handleCANSubmit = async (data: CANFormData) => {
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

      // Call CAN registration function
      const { error } = await supabase.functions.invoke('register-can', {
        body: {
          ...data,
          panNumber: kycForm.getValues('panNumber'),
          panDocumentUrl: panPath,
          aadhaarDocumentUrl: aadhaarPath,
        },
      });

      if (error) throw error;

      // Update user profile
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: kycForm.getValues('email'),
          full_name: kycForm.getValues('fullName'),
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          onboarding_status: 'NEEDS_MANDATE',
          updated_at: new Date().toISOString(),
        });

      toast.success('CAN registration completed successfully!');
      setCurrentStep(3);
    } catch (error) {
      console.error('CAN registration error:', error);
      toast.error('Failed to complete CAN registration. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleMandateSubmit = async (data: MandateFormData) => {
    if (!user) return;

    setUploading(true);
    try {
      // Call mandate registration function
      const { error } = await supabase.functions.invoke('register-mandate', {
        body: data,
      });

      if (error) throw error;

      // Update user profile to complete
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: kycForm.getValues('email'),
          onboarding_status: 'COMPLETE',
          updated_at: new Date().toISOString(),
        });

      toast.success('Mandate registration completed! Welcome to FundFlow!');
      onComplete();
    } catch (error) {
      console.error('Mandate registration error:', error);
      toast.error('Failed to complete mandate registration. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { id: 1, title: 'KYC Verification', icon: Shield },
    { id: 2, title: 'CAN Registration', icon: Building2 },
    { id: 3, title: 'Mandate Setup', icon: CreditCard },
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Complete Your Profile to Start Investing
          </h1>
          <p className="text-muted-foreground">
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
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted ? 'bg-success border-success text-success-foreground' :
                    isActive ? 'bg-primary border-primary text-primary-foreground' :
                    'bg-background border-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  <div className="ml-2 text-left">
                    <div className="font-medium text-sm text-foreground">{step.title}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-4 rounded ${
                      isCompleted ? 'bg-success' : 'bg-muted'
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
          {/* Step 1: KYC Verification */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Shield className="w-6 h-6 mr-3 text-primary" />
                    Step 1: KYC Verification
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Verify your identity with CAMS KRA to ensure regulatory compliance
                  </p>
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
                        <Alert className="border-primary/20 bg-primary/5">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
                              className="underline hover:no-underline"
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

          {/* Step 2: CAN Registration */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Building2 className="w-6 h-6 mr-3 text-primary" />
                    Step 2: CAN Registration
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Complete your Common Account Number registration with MF Utilities
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...canForm}>
                    <form onSubmit={canForm.handleSubmit(handleCANSubmit)} className="space-y-8">
                      <Tabs defaultValue="personal" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="personal">Personal</TabsTrigger>
                          <TabsTrigger value="address">Address</TabsTrigger>
                          <TabsTrigger value="bank">Bank Details</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={canForm.control}
                              name="fathersName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Father's Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter father's name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={canForm.control}
                              name="mothersName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mother's Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter mother's name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={canForm.control}
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
                              control={canForm.control}
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

                            <FormField
                              control={canForm.control}
                              name="occupation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Occupation</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Software Engineer" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="address" className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            <FormField
                              control={canForm.control}
                              name="permanentAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Permanent Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter permanent address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={canForm.control}
                              name="correspondenceAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correspondence Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter correspondence address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <FormField
                                control={canForm.control}
                                name="city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter city" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={canForm.control}
                                name="state"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter state" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={canForm.control}
                                name="pincode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pincode</FormLabel>
                                    <FormControl>
                                      <Input placeholder="110001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="bank" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Bank Account Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={canForm.control}
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
                                control={canForm.control}
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
                                control={canForm.control}
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
                                control={canForm.control}
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

                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Nominee Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <FormField
                                control={canForm.control}
                                name="nomineeName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nominee Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter nominee's name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={canForm.control}
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
                                control={canForm.control}
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
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Document Upload</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label>PAN Card (Signed Copy)</Label>
                                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/10 transition-colors">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="pan-upload"
                                  />
                                  <label htmlFor="pan-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {panFile ? panFile.name : 'Click to upload PAN card'}
                                    </p>
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Aadhaar Card (Signed Copy)</Label>
                                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/10 transition-colors">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="aadhaar-upload"
                                  />
                                  <label htmlFor="aadhaar-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                      {aadhaarFile ? aadhaarFile.name : 'Click to upload Aadhaar card'}
                                    </p>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

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
                              Registering CAN...
                            </>
                          ) : (
                            'Complete CAN Registration'
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Mandate Registration */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <CreditCard className="w-6 h-6 mr-3 text-primary" />
                    Step 3: NACH e-Mandate Setup
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Set up auto-debit for seamless SIP investments
                  </p>
                </CardHeader>
                <CardContent>
                  <Form {...mandateForm}>
                    <form onSubmit={mandateForm.handleSubmit(handleMandateSubmit)} className="space-y-6">
                      <Alert className="border-primary/20 bg-primary/5">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <AlertDescription>
                          This sets up auto-payment for your SIP investments. You can modify or cancel this mandate at any time.
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={mandateForm.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Account Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your account number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mandateForm.control}
                          name="maxAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Monthly Amount (₹)</FormLabel>
                              <FormControl>
                                <Input placeholder="25000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={mandateForm.control}
                          name="authMethod"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Authentication Method</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select authentication method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="netbanking">Net Banking</SelectItem>
                                  <SelectItem value="debit_card">Debit Card</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {mandateForm.watch('authMethod') === 'debit_card' && (
                          <>
                            <FormField
                              control={mandateForm.control}
                              name="debitCardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Debit Card Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234 5678 9012 3456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={mandateForm.control}
                              name="debitCardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <FormControl>
                                    <Input placeholder="MM/YY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCurrentStep(2)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Setting up Mandate...
                            </>
                          ) : (
                            'Complete Setup & Start Investing!'
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