import { useState, useEffect, useMemo } from "react";

import {

  Search,

  TrendingUp,

  Star,

  Eye,

  Loader2,

  AlertTriangle,

  X,

  BarChart,

  Percent,

  LineChart,

  Shield,

  Wallet,

  Calendar,

  Info

} from "lucide-react";



// Mock ShadCN UI Components for this self-contained example

const Card = ({ children, className = "" }) => <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>{children}</div>;

const CardContent = ({ children, className = "" }) => <div className={`p-6 ${className}`}>{children}</div>;

const Button = ({ children, className = "", variant = "default", size = "default", ...props }) => {

    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = {

        default: "bg-blue-600 text-white hover:bg-blue-600/90",

        outline: "border border-input bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-accent-foreground",

        destructive: "bg-red-600 text-destructive-foreground hover:bg-red-600/90",

        ghost: "hover:bg-accent hover:text-accent-foreground",

    };

    const sizeStyles = {

      default: "h-10 px-4 py-2",

      sm: "h-9 rounded-md px-3",

      lg: "h-11 rounded-md px-8",

      icon: "h-10 w-10",

    };

    return <button className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} {...props}>{children}</button>;

};

const Input = ({ className = "", ...props }) => <input className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />;

const Badge = ({ children, className = "", variant = "default" }) => {

    const variantStyles = {

        default: "border-transparent bg-blue-600 text-white",

        outline: "border-gray-300 dark:border-gray-600 text-foreground",

        recommended: "border-transparent bg-green-500 text-white",

    };

    return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantStyles[variant]} ${className}`}>{children}</div>;

};

const Select = ({ children, className = "", ...props }) => <select className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</select>;



// Main App Structure (Header, Footer, etc.)

const Header = () => <header className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40"><div className="container mx-auto px-4 h-16 flex items-center justify-between"><div className="font-bold text-xl text-gray-800 dark:text-white">FundFinder</div><nav><Button variant="ghost">Login</Button></nav></div></header>;

const Footer = () => <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto"><div className="container mx-auto px-4 py-6 text-center text-gray-500">&copy; 2024 FundFinder. All Rights Reserved.</div></footer>;





// Interface for a Mutual Fund

interface Fund {

  id: number | string;

  name: string;

  category: string;

  rating: number;

  nav: number;

  returns: { "1Y": number; "3Y": number; "5Y": number };

  expenseRatio: number;

  aum: string;

  aumValue: number; // For sorting

  riskLevel: string;

  minInvestment: number;

  sipMinimum: number;

  isRecommended: boolean;

  // For details modal

  fundManager: string;

  inceptionDate: string;

  benchmark: string;

}



// Comprehensive mock data based on the new API structure

const apiMockData = {

  "Debt": {

    "Floating Rate": [

      { "fund_name": "Axis Floater Fund Regular Growth", "latest_nav": 1313.9, "asset_size": 179.72, "1_year_return": 9.87, "3_year_return": 8.36, "5_year_return": null, "star_rating": 4 },

      { "fund_name": "DSP Floater Fund Regular Growth", "latest_nav": 13.3, "asset_size": 580, "1_year_return": 9.35, "3_year_return": 8.28, "5_year_return": null, "star_rating": 4 },

      { "fund_name": "ICICI Prudential Floating Interest Fund Growth", "latest_nav": 427.31, "asset_size": 7428.55, "1_year_return": 8.34, "3_year_return": 8.17, "5_year_return": 6.5, "star_rating": 4 },

      { "fund_name": "HDFC Floating Rate Debt - Plan - Growth", "latest_nav": 50.38, "asset_size": 15296.88, "1_year_return": 8.91, "3_year_return": 8.14, "5_year_return": 6.68, "star_rating": 4 },

      { "fund_name": "Franklin India Floating Rate Growth", "latest_nav": 41.23, "asset_size": 336.98, "1_year_return": 9.32, "3_year_return": 8.07, "5_year_return": 6.24, "star_rating": 3 }

    ],

    "Fixed Maturity Intermediate-Term Bond": [

      { "fund_name": "SBI Fixed Maturity Plan Series 1 3668 Days Regular Growth", "latest_nav": 16.6, "asset_size": 49.38, "1_year_return": 10.22, "3_year_return": 8.89, "5_year_return": 6.54, "star_rating": null },

      { "fund_name": "Nippon India Fixed Horizon Fund XLI Series 8 Regular Growth", "latest_nav": 16.51, "asset_size": 64.19, "1_year_return": 10.12, "3_year_return": 8.76, "5_year_return": 6.38, "star_rating": null }

    ]

  },

  "Equity": {

      "Small Cap": [

        { "fund_name": "Quant Small Cap Fund", "latest_nav": 281.23, "asset_size": 21242, "1_year_return": 67.4, "3_year_return": 34.1, "5_year_return": 44.8, "star_rating": 5 },

        { "fund_name": "Nippon India Small Cap Fund", "latest_nav": 185.7, "asset_size": 51566, "1_year_return": 56.9, "3_year_return": 31.5, "5_year_return": 34.8, "star_rating": 4 }

      ],

      "Large Cap": [

        { "fund_name": "ICICI Prudential Bluechip Fund", "latest_nav": 101.45, "asset_size": 55333, "1_year_return": 38.9, "3_year_return": 21.3, "5_year_return": 20.5, "star_rating": 4 },

        { "fund_name": "Canara Robeco Bluechip Equity Fund", "latest_nav": 61.3, "asset_size": 12853, "1_year_return": 35.8, "3_year_return": 19.8, "5_year_return": 20.1, "star_rating": 4 }

      ],

      "Mid Cap": [

        { "fund_name": "HDFC Mid-Cap Opportunities Fund", "latest_nav": 179.7, "asset_size": 65394, "1_year_return": 53.1, "3_year_return": 27.8, "5_year_return": 26.9, "star_rating": 4 }

      ],

      "Flexi Cap": [

        { "fund_name": "Parag Parikh Flexi Cap Fund", "latest_nav": 77.9, "asset_size": 66383, "1_year_return": 39.3, "3_year_return": 22.1, "5_year_return": 24.5, "star_rating": 5 }

      ]

  }

};





// Helper to format currency

const formatCurrency = (amount: number) =>

  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);



// Helper to get risk color

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



// Modal Component to show fund details

const FundDetailsModal = ({ fund, onClose }: { fund: Fund | null; onClose: () => void; }) => {

    if (!fund) return null;



    return (

        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>

            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>

                <CardContent className="p-0">

                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">

                        <div>

                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fund.name}</h2>

                            <p className="text-gray-500 dark:text-gray-400">{fund.category}</p>

                        </div>

                        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">

                            <X className="h-6 w-6" />

                        </Button>

                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        <div className="flex items-center space-x-3">

                            <LineChart className="h-6 w-6 text-blue-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Current NAV</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">₹{fund.nav}</div>

                            </div>

                        </div>

                        <div className="flex items-center space-x-3">

                            <Wallet className="h-6 w-6 text-green-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Assets Under Management (AUM)</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{fund.aum}</div>

                            </div>

                        </div>

                        <div className="flex items-center space-x-3">

                            <Percent className="h-6 w-6 text-purple-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Expense Ratio</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{fund.expenseRatio > 0 ? `${fund.expenseRatio}%` : 'N/A'}</div>

                            </div>

                        </div>

                        <div className="flex items-center space-x-3">

                            <Shield className={`h-6 w-6 ${getRiskColor(fund.riskLevel)}`} />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Risk Level</div>

                                <div className={`text-lg font-semibold ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</div>

                            </div>

                        </div>

                        <div className="flex items-center space-x-3">

                            <Info className="h-6 w-6 text-gray-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Fund Manager</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{fund.fundManager}</div>

                            </div>

                        </div>

                         <div className="flex items-center space-x-3">

                            <Calendar className="h-6 w-6 text-gray-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Inception Date</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{fund.inceptionDate}</div>

                            </div>

                        </div>

                         <div className="md:col-span-2 flex items-center space-x-3">

                            <BarChart className="h-6 w-6 text-gray-500" />

                            <div>

                                <div className="text-sm text-gray-500 dark:text-gray-400">Benchmark</div>

                                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{fund.benchmark}</div>

                            </div>

                        </div>

                    </div>

                     <div className="p-6 bg-gray-50 dark:bg-gray-800/50">

                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Annualized Returns</h3>

                        <div className="grid grid-cols-3 gap-4 text-center">

                            {Object.entries(fund.returns).map(([period, returnValue]) => (

                                <div key={period}>

                                    <div className="text-sm text-gray-500 dark:text-gray-400">{period}</div>

                                    <div className={`text-xl font-bold ${returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>

                                        {returnValue > 0 ? `+${returnValue.toFixed(2)}%` : `${returnValue.toFixed(2)}%`}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </CardContent>

            </Card>

        </div>

    );

};





// Main Watchlist Component

const Watchlist = () => {

  const [masterFundList, setMasterFundList] = useState<Fund[]>([]);

  const [displayedFunds, setDisplayedFunds] = useState<Fund[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("default");

  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

 

  // NOTE: This is a placeholder for a real API key.

  // Replace with a valid key to enable live search.

  const apiKey = "YOUR_API_KEY_HERE";



  // Maps the static mock data structure to our internal Fund interface

  const mapMockApiDataToFund = (apiFund: any, primaryCategory: string, subCategory: string): Fund => {

    const aumValue = apiFund.asset_size || 0;

    const rating = apiFund.star_rating || 0;

    const oneYearReturn = apiFund["1_year_return"] || 0;



    let riskLevel = "Moderate";

    if (primaryCategory === 'Equity') {

        if (subCategory.includes('Small Cap')) riskLevel = 'Very High';

        else if (subCategory.includes('Mid Cap')) riskLevel = 'High';

        else riskLevel = 'Moderately High';

    } else if (primaryCategory === 'Debt') {

        riskLevel = 'Low to Moderate';

    }



    return {

      id: apiFund.fund_name,

      name: apiFund.fund_name,

      category: `${primaryCategory} - ${subCategory}`,

      rating: rating,

      nav: apiFund.latest_nav || 0,

      returns: { "1Y": oneYearReturn, "3Y": apiFund["3_year_return"] || 0, "5Y": apiFund["5_year_return"] || 0 },

      expenseRatio: apiFund.expense_ratio || 0,

      aumValue: aumValue,

      aum: `₹${Math.round(aumValue).toLocaleString()} Cr`,

      riskLevel: riskLevel,

      minInvestment: 500,

      sipMinimum: 500,

      isRecommended: rating >= 4 && oneYearReturn > 25,

      fundManager: 'N/A',

      inceptionDate: 'N/A',

      benchmark: 'N/A',

    };

  };



  // Maps the live API search result to our internal Fund interface

  const mapLiveApiDataToFund = (data: any): Fund | null => {

    if (!data || !data.basic_info) return null;

    const aumValue = data.basic_info.fund_size || 0;

    return {

      id: data.basic_info.fund_name,

      name: data.basic_info.fund_name,

      category: data.basic_info.category,

      rating: Math.round(data.returns.risk_metrics?.risk_rating || 0),

      nav: data.nav_info.current_nav,

      returns: { "1Y": data.returns.absolute["1y"] || 0, "3Y": data.returns.cagr["3y"] || 0, "5Y": data.returns.cagr["5y"] || 0 },

      expenseRatio: data.expense_ratio.current || 0,

      aumValue: aumValue,

      aum: `₹${Math.round(aumValue).toLocaleString()} Cr`,

      riskLevel: data.basic_info.risk_level.replace(" Risk", ""),

      minInvestment: 500,

      sipMinimum: 500,

      isRecommended: (data.returns.cagr["5y"] || 0) > 20 && (data.expense_ratio.current || 0) < 1.5,

      fundManager: data.basic_info.fund_manager,

      inceptionDate: data.basic_info.inception_date,

      benchmark: data.basic_info.benchmark,

    };

  };





  // Load and process data on initial component mount

  useEffect(() => {

    setLoading(true);

    try {

      const allFunds: Fund[] = [];

      for (const primaryCategory in apiMockData) {

        const subCategories = apiMockData[primaryCategory as keyof typeof apiMockData];

        for (const subCategory in subCategories) {

          const funds = subCategories[subCategory as keyof typeof subCategories];

          funds.forEach((apiFund: any) => {

            allFunds.push(mapMockApiDataToFund(apiFund, primaryCategory, subCategory));

          });

        }

      }

      setMasterFundList(allFunds);

      setDisplayedFunds(allFunds);

      setLoading(false);

    } catch (err) {

      setError("Failed to process fund data.");

      setLoading(false);

    }

  }, []);



  // Effect for handling search logic (API call or local filter)

  useEffect(() => {

    const isApiKeyMissing = !apiKey || apiKey === "YOUR_API_KEY_HERE";



    // Debounce search input

    const handler = setTimeout(async () => {

      setNotification(null);

      if (!searchTerm) {

        setDisplayedFunds(masterFundList); // Reset to full list if search is cleared

        return;

      }



      setLoading(true);

      setError(null);



      // If no API key, filter local mock data

      if (isApiKeyMissing) {

        setNotification("API key not found. Searching local data.");

        const filtered = masterFundList.filter(fund =>

            fund.name.toLowerCase().includes(searchTerm.toLowerCase())

        );

        setDisplayedFunds(filtered);

        setLoading(false);

        return;

      }



      // If API key exists, hit the live API

      try {

        const res = await fetch(`https://stock.indianapi.in/mutual_funds_details?stock_name=${searchTerm}`, {

          headers: { "x-api-key": apiKey }

        });



        if (!res.ok) {

            if (res.status === 404) throw new Error(`No fund found for "${searchTerm}".`);

            throw new Error("API request failed. Please try again.");

        }



        const data = await res.json();

        const fund = mapLiveApiDataToFund(data);

        setDisplayedFunds(fund ? [fund] : []);

      } catch (err: any) {

        setError(err.message || "Error fetching searched fund.");

        setDisplayedFunds([]);

      } finally {

        setLoading(false);

      }

    }, 500); // 500ms debounce delay



    return () => {

      clearTimeout(handler); // Cleanup timeout on component unmount or re-render

    };

  }, [searchTerm, masterFundList]); // Rerun effect when searchTerm or master list changes



  // Memoized sorting logic

  const sortedFunds = useMemo(() => {

    const sorted = [...displayedFunds];

    if (sortBy === 'default') {

      return sorted;

    }

    return sorted.sort((a, b) => {

        switch (sortBy) {

            case 'rating': return b.rating - a.rating;

            case 'nav': return b.nav - a.nav;

            case '1y': return b.returns['1Y'] - a.returns['1Y'];

            case 'aum': return b.aumValue - a.aumValue;

            default: return 0;

        }

    });

  }, [displayedFunds, sortBy]);



  return (

    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200">

      <Header />

      <main className="container mx-auto px-4 py-8 flex-grow">

        {/* Header */}

        <div className="mb-8 text-center">

          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Explore Mutual Funds</h1>

          <p className="text-lg text-gray-600 dark:text-gray-400">Discover trending funds and search the Indian market.</p>

        </div>



        {/* Search and Filter */}

        <Card className="shadow-lg mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-[65px] z-30">

          <CardContent className="p-4 sm:p-6">

            <div className="flex flex-col sm:flex-row gap-4">

              <div className="relative flex-grow">

                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />

                <Input

                  placeholder="Search funds by name (e.g., Nippon, Quant)..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  className="pl-10 h-12 text-base"

                />

              </div>

              <div className="flex-shrink-0">

                <Select

                    value={sortBy}

                    onChange={(e) => setSortBy(e.target.value)}

                    className="h-12 text-base w-full sm:w-auto"

                    disabled={loading || !!error}

                >

                    <option value="default">Sort By: Default</option>

                    <option value="rating">Rating (High to Low)</option>

                    <option value="1y">1Y Returns (High to Low)</option>

                    <option value="aum">AUM (High to Low)</option>

                    <option value="nav">NAV (High to Low)</option>

                </Select>

              </div>

            </div>

          </CardContent>

        </Card>



        {/* Notification Banner */}

        {notification && (

            <div className="mb-6 flex items-center gap-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-300">

                <Info className="h-5 w-5 flex-shrink-0" />

                <p>{notification}</p>

            </div>

        )}



        {/* Loading and Error States */}

        {loading && (

          <div className="flex justify-center items-center py-20 flex-col">

            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />

            <span className="mt-4 text-lg text-gray-500 dark:text-gray-400">Searching...</span>

          </div>

        )}

        {error && (

          <div className="flex flex-col justify-center items-center py-20 bg-red-50 dark:bg-red-900/20 rounded-lg text-center px-4">

            <AlertTriangle className="h-12 w-12 text-red-500" />

            <p className="mt-4 text-xl font-semibold text-red-600 dark:text-red-400">Search Error</p>

            <p className="text-gray-600 dark:text-gray-300 max-w-md">{error}</p>

          </div>

        )}



        {/* Funds Display */}

        {!loading && !error && (

          <div className="space-y-4">

            {sortedFunds.length > 0 ? sortedFunds.map(fund => (

              <Card key={fund.id} className="shadow-md hover:shadow-xl hover:border-blue-500 transition-all duration-300 border-l-4 border-transparent">

                <CardContent className="p-4 sm:p-6">

                  <div className="grid grid-cols-12 gap-4 sm:gap-6 items-center">

                    {/* Info */}

                    <div className="col-span-12 lg:col-span-4">

                      <div className="flex items-start space-x-4">

                        <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3 hidden sm:block"><TrendingUp className="h-6 w-6 text-blue-500" /></div>

                        <div className="flex-1">

                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">{fund.name}</h3>

                           <div className="flex items-center flex-wrap gap-2 mt-2">

                             <Badge variant="outline">{fund.category}</Badge>

                             <div className="flex items-center">

                               {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < fund.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />)}

                               <span className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">({fund.rating}.0)</span>

                             </div>

                             {fund.isRecommended && <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Recommended</Badge>}

                           </div>

                        </div>

                      </div>

                    </div>



                    {/* Returns */}

                    <div className="col-span-12 lg:col-span-3">

                      <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">

                        {Object.entries(fund.returns).map(([period, returnValue]) => (

                          <div key={period}>

                            <div className="text-xs text-gray-500 dark:text-gray-400">{period}</div>

                            <div className={`font-semibold mt-1 text-md ${returnValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>

                              {returnValue ? `${returnValue.toFixed(2)}%` : 'N/A'}

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>



                    {/* Other Details */}

                    <div className="col-span-12 lg:col-span-3 space-y-2 text-sm px-2">

                      <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">AUM:</span><span className="font-medium text-gray-800 dark:text-gray-200">{fund.aum}</span></div>

                      <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Risk:</span><span className={`font-medium ${getRiskColor(fund.riskLevel)}`}>{fund.riskLevel}</span></div>

                      <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">NAV:</span><span className="font-medium text-gray-800 dark:text-gray-200">₹{fund.nav.toFixed(2)}</span></div>

                    </div>



                    {/* Buttons */}

                    <div className="col-span-12 lg:col-span-2">

                      <div className="flex justify-center">

                        <Button size="sm" variant="outline" onClick={() => setSelectedFund(fund)} className="w-full lg:w-auto">

                          <Eye className="h-4 w-4 mr-2" />View Details

                        </Button>

                      </div>

                    </div>

                  </div>

                </CardContent>

              </Card>

            )) : (

              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg">

                 <Search className="mx-auto h-12 w-12 text-gray-400" />

                 <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Funds Found</h3>

                 <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your search did not match any funds.</p>

              </div>

            )}

          </div>

        )}

      </main>

      <Footer />

     

      {/* Modal Render */}

      <FundDetailsModal fund={selectedFund} onClose={() => setSelectedFund(null)} />

     

      {/* CSS for animations */}

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



export default Watchlist;
