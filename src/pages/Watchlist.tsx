import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, X, Info, Wallet, BarChart, Percent, Calendar, Shield } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlistFunds, setWatchlistFunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFund, setSelectedFund] = useState<any | null>(null);

  const API_BASE_URL = "https://stock.indianapi.in/mutual_funds_details";
  const API_KEY = import.meta.env.VITE_INDIAN_STOCK_API_KEY;

  // fetchFunds is memoized with useCallback.
  // It only re-creates if API_KEY changes.
  // INITIAL_FUND_NAMES is now outside, so its reference is stable.
  const fetchFunds = useCallback(async (query?: string, initialLoad: boolean = false) => {
    // Check if API_KEY is available and valid
    if (!API_KEY || API_KEY === "YOUR_ACTUAL_API_KEY_HERE" || API_KEY.trim() === "") {
        console.warn("API Key is missing or invalid. Please check your .env file.");
        setError("API Key is not configured. Please set VITE_INDIAN_STOCK_API_KEY in your .env file.");
        setLoading(false);
        setWatchlistFunds([]);
        return;
    }

    setLoading(true);
    setError(""); // Clear previous errors at the start of fetch

    try {
      let fundsToFetch: string[] = [];
      if (initialLoad && INITIAL_FUND_NAMES.length > 0) {
        fundsToFetch = INITIAL_FUND_NAMES;
      } else if (query && query.trim() !== "") {
        fundsToFetch = [query.trim()]; // Search for single fund
      } else {
        // If not initial load and query is empty, clear funds and stop loading
        setWatchlistFunds([]);
        setLoading(false);
        return;
      }

      const fetchedFunds: any[] = [];
      for (const fundName of fundsToFetch) {
        try {
          // Introduce a delay if fetching multiple funds to avoid rate limits
          if (fundsToFetch.length > 1) {
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 0.5 seconds
          }

          console.log(`Attempting to fetch: ${fundName}`);
          const response = await axios.get(API_BASE_URL, {
            headers: {
              "x-api-key": API_KEY,
            },
            params: {
              stock_name: fundName
            },
          });

          const data = response.data;
          console.log(`Response for ${fundName}:`, data);
          if (data && data.basic_info && data.basic_info.fund_name) {
            fetchedFunds.push(data);
          } else {
            console.warn(`No valid data structure found for fund: ${fundName}`, data);
          }
        } catch (innerErr: any) {
          console.warn(`Error fetching details for ${fundName}:`, innerErr.response?.data || innerErr.message);
          // If a 429 (Too Many Requests) is received, stop trying to fetch more funds
          if (axios.isAxiosError(innerErr) && innerErr.response?.status === 429) {
              setError("Rate limit exceeded. Please wait a moment and refresh, or try fewer initial funds.");
              setWatchlistFunds([]); // Clear existing funds if rate limited
              setLoading(false); // Ensure loading is off
              return; // Exit the fetchFunds function immediately
          }
        }
      }

      if (fetchedFunds.length > 0) {
        setWatchlistFunds(fetchedFunds);
        setError(""); // Clear error if funds were successfully fetched
      } else if (initialLoad && INITIAL_FUND_NAMES.length > 0) {
        setError("Could not fetch any of the specified initial funds. Please check their names, your API key, or try again later due to rate limits.");
        setWatchlistFunds([]);
      } else if (query && query.trim() !== "") {
        setError(`No fund found for "${query}". Please check the name and try again.`);
        setWatchlistFunds([]);
      }

    } catch (err: any) {
      console.error("API error fetching funds (overall catch):", err);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError("Authentication error: Invalid or missing API key. Please check your .env file.");
          } else if (err.response.status === 429) { // Redundant but good to have here too
            setError("Rate limit exceeded for initial load. Please try again in a few minutes.");
          } else {
            setError(`Server error: ${err.response.status} - ${err.response.data?.message || err.message}`);
          }
        } else if (err.request) {
          setError("Network error: No response from server. Please check your internet connection.");
        } else {
          setError(`Request error: ${err.message}`);
        }
      } else {
        setError("An unexpected error occurred while fetching data.");
      }
      setWatchlistFunds([]); // Clear funds on overall error
    } finally {
      setLoading(false);
    }
  }, [API_KEY]); // Dependency: API_KEY. INITIAL_FUND_NAMES is not a dependency as it's outside.

  // Initial fetch for watchlist funds
  useEffect(() => {
    console.log("Initial fetch useEffect triggered.");
    fetchFunds(undefined, true);
  }, [fetchFunds]); // fetchFunds is a stable reference due to useCallback

  // Debounced search effect
  useEffect(() => {
    console.log("Debounced search useEffect triggered. searchTerm:", searchTerm);
    if (searchTerm.trim().length > 0) {
      const delayDebounce = setTimeout(() => {
        fetchFunds(searchTerm, false);
      }, 500);

      return () => clearTimeout(delayDebounce); // Cleanup function for debounce
    } else {
      // When search term is cleared, revert to initial list
      console.log("Search term cleared, re-fetching initial funds.");
      fetchFunds(undefined, true);
    }
  }, [searchTerm, fetchFunds]); // searchTerm and stable fetchFunds are dependencies

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
                placeholder="Search funds by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Watchlist Funds</span>
                  <Badge variant="secondary">{watchlistFunds.length} funds</Badge>
                </CardTitle>
                <CardDescription>
                  Monitor performance and track NAV changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading funds...</p>}
                {error && <p className="text-destructive text-sm text-center py-4">{error}</p>}
                {!loading && watchlistFunds.length === 0 && !error && (
                    <p className="text-center text-muted-foreground py-4">No funds in your watchlist or search results.</p>
                )}
                {!loading && watchlistFunds.length > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fund Name</TableHead>
                          <TableHead>NAV</TableHead>
                          <TableHead>1Y Return</TableHead>
                          <TableHead>Expense</TableHead>
                          <TableHead>AUM</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchlistFunds.map((fund: any, i) => (
                          <TableRow key={fund.basic_info?.fund_name || i}>
                            <TableCell className="font-medium">{fund.basic_info?.fund_name || "N/A"}</TableCell>
                            <TableCell>₹{fund.nav_info?.current_nav?.toFixed(2) || "N/A"}</TableCell>
                            <TableCell>{formatChange(fund.returns?.absolute?.["1y"])}</TableCell>
                            <TableCell>{fund.expense_ratio?.current?.toFixed(2) || "N/A"}%</TableCell>
                            <TableCell>
                                {fund.basic_info?.fund_size ? `₹${(fund.basic_info.fund_size / 10000000).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} Cr` : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => setSelectedFund(fund)}>
                                <Eye className="h-4 w-4 mr-1" /> View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
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