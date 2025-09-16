import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, X, Info, Wallet, BarChart, Percent, Calendar, Shield, Bookmark, Loader2 } from "lucide-react";

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
  const riskLevel = getFundDetail(["basic_info", "risk_level"], "N/A").replace(" Risk", "");
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
    if (value === 0) return "N/A";
    const formatted = value.toFixed(2);
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up bg-white dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
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
           {/* ... (Modal content from your original code) ... */}
        </CardContent>
      </Card>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};


// --- Main Watchlist Component ---
const Watchlist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  const [bookmarkedIsins, setBookmarkedIsins] = useState<Set<string>>(new Set());
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  
  const [selectedFund, setSelectedFund] = useState<any | null>(null);

  const WATCHLIST_STORAGE_KEY = 'fundflow-watchlist';

  // Load watchlist from localStorage on initial component mount
  useEffect(() => {
    try {
      const savedIsins = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (savedIsins) {
        setBookmarkedIsins(new Set(JSON.parse(savedIsins)));
      }
    } catch (error) {
      console.error("Failed to load watchlist from localStorage", error);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(Array.from(bookmarkedIsins)));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  }, [bookmarkedIsins]);

  // Fetch data for bookmarked funds whenever the list changes
  useEffect(() => {
    const isins = Array.from(bookmarkedIsins);
    if (isins.length === 0) {
      setLiveData({});
      return;
    }

    let aborted = false;
    const controller = new AbortController();
    
    const fetchWatchlistData = async () => {
      setIsWatchlistLoading(true);
      try {
        const response = await fetch('/api/funds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isins }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch watchlist data");
        
        const data = await response.json();
        if (aborted) return;

        const dataMap = (data.results || []).reduce((acc: Record<string, any>, fund: any) => {
          acc[fund.isin] = fund;
          return acc;
        }, {});

        setLiveData(dataMap);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching watchlist data:", error);
        }
      } finally {
        if (!aborted) setIsWatchlistLoading(false);
      }
    };

    fetchWatchlistData();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [bookmarkedIsins]);
  
  // Debounced search effect
  useEffect(() => {
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setIsSearchLoading(true);
      fetch(`/api/funds?q=${encodeURIComponent(trimmedSearch)}`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setSearchResults(data.results || []))
        .catch(err => {
          if (err.name !== 'AbortError') console.error("Search failed:", err);
        })
        .finally(() => setIsSearchLoading(false));
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const handleBookmarkToggle = (isin: string) => {
    setBookmarkedIsins(prevIsins => {
      const newIsins = new Set(prevIsins);
      if (newIsins.has(isin)) {
        newIsins.delete(isin);
      } else {
        newIsins.add(isin);
      }
      return newIsins;
    });
  };

  const itemsToDisplay = useMemo(() => {
    if (searchTerm.trim()) {
      return searchResults;
    }
    return Array.from(bookmarkedIsins).map(isin => liveData[isin]).filter(Boolean);
  }, [searchTerm, searchResults, bookmarkedIsins, liveData]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Fund Watchlist</h1>
          <p className="text-xl text-muted-foreground mb-6">Track and analyze mutual funds - no login required</p>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for mutual funds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
             {isSearchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {searchTerm.trim() ? "Search Results" : "My Watchlist"}
            </CardTitle>
            <CardDescription>
              {searchTerm.trim() ? `Showing results for "${searchTerm}"` : "Funds you are currently tracking"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fund Name</TableHead>
                  <TableHead>Latest NAV</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(isWatchlistLoading && !searchTerm.trim()) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                )}
                {!isWatchlistLoading && itemsToDisplay.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      {searchTerm.trim() ? "No results found." : "Your watchlist is empty. Search for funds to add them."}
                    </TableCell>
                  </TableRow>
                )}
                {itemsToDisplay.map((fund) => (
                  <TableRow key={fund.isin}>
                    <TableCell className="font-medium">{fund.scheme_name}</TableCell>
                    <TableCell>
                      {liveData[fund.isin]?.nav ? `₹${liveData[fund.isin].nav.toFixed(2)} on ${liveData[fund.isin].date}` : '...'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => handleBookmarkToggle(fund.isin)}>
                        <Bookmark className={`h-5 w-5 ${bookmarkedIsins.has(fund.isin) ? 'text-blue-500 fill-current' : 'text-gray-400'}`} />
                      </Button>
                      {/* You can add a "Details" button here later if needed */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Footer />
      {selectedFund && <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />}
    </div>
  );
};

export default Watchlist;