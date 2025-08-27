import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, X, Info, Wallet, BarChart, Percent, Calendar, Shield, Bookmark, BookmarkPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// --- Define initialFundNames OUTSIDE the component ---
// This array is now only created once when the module loads,
// ensuring a stable reference for useCallback/useEffect dependencies.
const INITIAL_FUND_NAMES = [
  "ICICI Prudential Bluechip Fund Direct Growth",
  "Axis Small Cap Fund Direct Growth",
  "Mirae Asset Large Cap Fund Direct Growth",
  "Parag Parikh Flexi Cap Fund Direct Growth",
  "SBI Equity Hybrid Fund Direct Growth"
];

// --- Fund interface for local data structure ---
interface LocalFund {
  id: string;
  scheme_code: string;
  scheme_name: string;
  amc_name: string;
  fund_category: string;
  fund_subcategory: string;
  risk_level: string;
  current_nav: number;
  minimum_sip_amount: number;
  minimum_lumpsum_amount: number;
  expense_ratio: number;
  aum: number;
  return_1day: number;
  return_1week: number;
  return_1month: number;
  return_3month: number;
  return_6month: number;
  return_1year: number;
  return_3year: number;
  return_5year: number;
  fund_manager_name: string;
  fund_manager_experience: number;
  is_active: boolean;
  launch_date: string;
}

// --- FundDetailsModal Component ---
interface FundDetailsModalProps {
  fund: any; // Using 'any' based on your API response structure
  onClose: () => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Low": return "text-cyan-500";
    case "Low to Moderate": return "text-green-500";
    case "Moderate": return "text-yellow-500";
    case "Moderately High": return "text-orange-500";
    case "High": return "text-red-500";
    case "Very High": return "text-red-700";
    default: return "text-gray-500";
  }
};

const FundDetailsModal: React.FC<FundDetailsModalProps> = ({ fund, onClose }) => {
  if (!fund) return null;

  // Function to safely get data, returning "N/A" if undefined
  const getFundDetail = (path: string[], defaultValue: any = "N/A") => {
    let value = fund;
    for (const key of path) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue;
      }
    }
    return value;
  };

  const currentNav = getFundDetail(["nav_info", "current_nav"]);
  const fundManager = getFundDetail(["basic_info", "fund_manager"]);
  const inceptionDate = getFundDetail(["basic_info", "inception_date"]);
  const benchmark = getFundDetail(["basic_info", "benchmark"]);
  const riskLevel = getFundDetail(["basic_info", "risk_level"], "N/A").replace(" Risk", ""); // Clean up " Risk" suffix
  const expenseRatio = getFundDetail(["expense_ratio", "current"], 0);
  const aumValue = getFundDetail(["basic_info", "fund_size"], 0);
  const returns1Y = getFundDetail(["returns", "absolute", "1y"], 0);
  const returns3Y = getFundDetail(["returns", "cagr", "3y"], 0);
  const returns5Y = getFundDetail(["returns", "cagr", "5y"], 0);
  const minSIP = getFundDetail(["investment_info", "minimum_sip"], "N/A");
  const minLumpsum = getFundDetail(["investment_info", "minimum_lumpsum"], "N/A");
  const stampDuty = getFundDetail(["investment_info", "stamp_duty"], "N/A");
  const fundHouseName = getFundDetail(["fund_house", "name"]);
  const exitLoad = getFundDetail(["exit_load"], []);
  const topHoldings = getFundDetail(["holdings"], []);

  const formatReturn = (value: number) => {
      if (value === 0) return "N/A"; // Or 0.00%
      const formatted = value.toFixed(2);
      return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Close modal on overlay click
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <CardHeader className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {fund.basic_info?.fund_name || "Fund Details"}
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {fund.basic_info?.category || "N/A"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
            <div className="flex items-center space-x-3">
              <Info className="h-6 w-6 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current NAV</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  ₹{typeof currentNav === 'number' ? currentNav.toFixed(2) : currentNav}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Assets Under Management (AUM)</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {aumValue > 0 ? `₹${(aumValue / 10000000).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} Cr` : "N/A"}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Percent className="h-6 w-6 text-purple-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Expense Ratio</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {expenseRatio > 0 ? `${expenseRatio}%` : 'N/A'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className={`h-6 w-6 ${getRiskColor(riskLevel)}`} />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>
                <div className={`text-lg font-semibold ${getRiskColor(riskLevel)}`}>{riskLevel}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Inception Date</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{inceptionDate}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <BarChart className="h-6 w-6 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Benchmark</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{benchmark}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Annualized Returns</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">1Y</div>
                <div className={`text-xl font-bold ${returns1Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatReturn(returns1Y)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">3Y</div>
                <div className={`text-xl font-bold ${returns3Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatReturn(returns3Y)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">5Y</div>
                <div className={`text-xl font-bold ${returns5Y >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatReturn(returns5Y)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Description:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getFundDetail(["additional_info", "description"], "No description available.")}
              </p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Fund Manager:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{fundManager}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Fund House:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{fundHouseName}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Investment Info:</p>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                <li>Minimum SIP: ₹{minSIP}</li>
                <li>Minimum Lumpsum: ₹{minLumpsum}</li>
                <li>Stamp Duty: {stampDuty}</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Exit Load:</p>
              {exitLoad.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {exitLoad.map((load: any, idx: number) => (
                    <li key={idx}>{load.description}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No exit load information available.</p>
              )}
            </div>

            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Top Holdings:</p>
              {topHoldings.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {topHoldings.slice(0, 5).map((h: any, i: number) => (
                    <li key={i}>{h.company_name} - {h.sector_name} ({h.corpus_percentage.toFixed(2)}%)</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">No top holdings information available.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

// --- Watchlist Component ---
const Watchlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [allFunds, setAllFunds] = useState<LocalFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFund, setSelectedFund] = useState<any | null>(null);
  const [bookmarkedFunds, setBookmarkedFunds] = useState<Set<string>>(new Set());
  const [liveData, setLiveData] = useState<Record<string, any>>({});

  // 🔄 Fetch all funds from Supabase on component mount
  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        setInitialLoading(true);
        setError("");

        const { data, error: supabaseError } = await supabase
          .from('mutual_fund_schemes')
          .select('*')
          .eq('is_active', true)
          .order('scheme_name');

        if (supabaseError) {
          setError("Failed to load fund database. Please try again later.");
          return;
        }

        if (data && data.length > 0) {
          setAllFunds(data);
        } else {
          setError("No funds available in the database.");
        }
      } catch (err: any) {
        setError("Failed to load fund database. Please check your connection and try again.");
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };

    fetchAllFunds();
  }, []);

  // 🔍 Local search filtering - instant and smooth
  const filteredFunds = useMemo(() => {
    if (!searchTerm.trim()) {
      // If no search term, show initial funds (first 20 for performance)
      return allFunds.slice(0, 20);
    }

    const searchLower = searchTerm.toLowerCase();
    return allFunds.filter(fund => 
      fund.scheme_name.toLowerCase().includes(searchLower) ||
      fund.amc_name.toLowerCase().includes(searchLower) ||
      fund.fund_category.toLowerCase().includes(searchLower)
    ).slice(0, 50); // Limit results for performance
  }, [allFunds, searchTerm]);

  // 📊 Convert local fund data to display format
  const displayFunds = useMemo(() => {
    return filteredFunds.map(fund => ({
      basic_info: {
        fund_name: fund.scheme_name,
        category: fund.fund_category,
        fund_manager: fund.fund_manager_name,
        inception_date: fund.launch_date,
        benchmark: "N/A", // Not available in local data
        risk_level: fund.risk_level,
        fund_size: fund.aum * 10000000 // Convert to match API format
      },
      nav_info: {
        current_nav: fund.current_nav
      },
      returns: {
        absolute: {
          "1y": fund.return_1year
        },
        cagr: {
          "3y": fund.return_3year,
          "5y": fund.return_5year
        }
      },
      expense_ratio: {
        current: fund.expense_ratio
      },
      investment_info: {
        minimum_sip: fund.minimum_sip_amount,
        minimum_lumpsum: fund.minimum_lumpsum_amount,
        stamp_duty: "N/A"
      },
      fund_house: {
        name: fund.amc_name
      },
      exit_load: [],
      holdings: [],
      additional_info: {
        description: `${fund.scheme_name} is a ${fund.fund_category} fund managed by ${fund.amc_name}.`
      }
    }));
  }, [filteredFunds]);

  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined) {
      return <span className="text-muted-foreground">N/A</span>;
    }
    const isPositive = change > 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  const handleBookmarkToggle = async (fundName: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "To create your own watchlist, please log in or sign up.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newSet = new Set(bookmarkedFunds);
      if (newSet.has(fundName)) newSet.delete(fundName); else newSet.add(fundName);
      setBookmarkedFunds(newSet);
      const scheme_codes = Array.from(newSet);
      await supabase.from('watchlist').upsert({ user_id: user.id, scheme_codes, updated_at: new Date().toISOString() });
      toast({ title: 'Watchlist updated' });
      if (scheme_codes.length > 0) {
        const { data, error } = await supabase.functions.invoke('fetch-market-data', { body: { scheme_codes } });
        if (!error && data?.data) {
          const map: Record<string, any> = {};
          for (const item of data.data) map[item.scheme_code] = item;
          setLiveData(map);
        }
      } else {
        setLiveData({});
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load user's watchlist and fetch live data
  useEffect(() => {
    if (!user) return;
    const loadAndFetch = async () => {
      const { data: wl } = await supabase.from('watchlist').select('scheme_codes').eq('user_id', user.id).maybeSingle();
      const codes: string[] = wl?.scheme_codes || [];
      setBookmarkedFunds(new Set(codes));
      if (codes.length > 0) {
        const { data, error } = await supabase.functions.invoke('fetch-market-data', { body: { scheme_codes: codes } });
        if (!error && data?.data) {
          const map: Record<string, any> = {};
          for (const item of data.data) map[item.scheme_code] = item;
          setLiveData(map);
        }
      } else {
        setLiveData({});
      }
    };
    loadAndFetch();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Fund Watchlist</h1>
          <p className="text-xl text-muted-foreground mb-6">Track and analyze your favorite mutual funds</p>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search funds by name, AMC, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={initialLoading}
              />
              {initialLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          {initialLoading && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading fund database...</p>
            </div>
          )}
        </div>

        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Fund Search</span>
                  <Badge variant="secondary">{displayFunds.length} funds</Badge>
                </CardTitle>
                <CardDescription>
                  {searchTerm.trim() ? `Search results for "${searchTerm}"` : "Browse and search mutual funds from the database"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {initialLoading && <p className="text-sm text-muted-foreground text-center py-4">Loading fund database...</p>}
                {error && <p className="text-destructive text-sm text-center py-4">{error}</p>}
                {!initialLoading && displayFunds.length === 0 && !error && (
                    <p className="text-center text-muted-foreground py-4">
                      {searchTerm.trim() ? `No funds found matching "${searchTerm}"` : "No funds available in the database."}
                    </p>
                )}
                {!initialLoading && displayFunds.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fund Name</TableHead>
                          <TableHead>NAV</TableHead>
                          <TableHead>1Y Return</TableHead>
                          <TableHead>Expense</TableHead>
                          <TableHead>AUM</TableHead>
                          <TableHead>Watchlist</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from(bookmarkedFunds).map(code => {
                          const item = liveData[code];
                          return (
                            <TableRow key={code}>
                              <TableCell className="font-medium">{item?.fund_name || code}</TableCell>
                              <TableCell>₹{item?.metrics?.nav?.toFixed(2) ?? '—'}</TableCell>
                              <TableCell>{formatChange(item?.metrics?.return_1y)}</TableCell>
                              <TableCell>{item?.metrics?.return_3y?.toFixed(2) ?? '—'}%</TableCell>
                              <TableCell>—</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleBookmarkToggle(code)} className="p-2">
                                  <Bookmark className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline">
                                  Invest Now
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />

      {/* Render the modal component if a fund is selected */}
      {selectedFund && <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />}
    </div>
  );
};

export default Watchlist;