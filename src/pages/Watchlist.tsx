import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Bell,
  Trash2,
  BarChart3,
  Filter,
  Star,
  StarOff
} from "lucide-react";

const Watchlist = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const watchlistFunds = [
    {
      id: 1,
      name: "ICICI Prudential Bluechip Fund",
      amc: "ICICI Prudential",
      category: "Large Cap",
      nav: 87.56,
      prevNav: 86.23,
      change1d: 1.54,
      change1w: 2.3,
      change1m: -1.2,
      change1y: 18.7,
      expenseRatio: 1.05,
      aum: "₹45,231 Cr",
      isInPortfolio: false
    },
    {
      id: 2,
      name: "SBI Small Cap Fund",
      amc: "SBI Mutual Fund",
      category: "Small Cap",
      nav: 156.78,
      prevNav: 159.45,
      change1d: -1.67,
      change1w: -3.2,
      change1m: 5.8,
      change1y: 28.4,
      expenseRatio: 1.85,
      aum: "₹18,567 Cr",
      isInPortfolio: true
    },
    {
      id: 3,
      name: "Axis Midcap Fund",
      amc: "Axis Mutual Fund",
      category: "Mid Cap",
      nav: 67.89,
      prevNav: 67.12,
      change1d: 1.15,
      change1w: 1.8,
      change1m: 3.4,
      change1y: 22.1,
      expenseRatio: 1.42,
      aum: "₹12,345 Cr",
      isInPortfolio: false
    },
    {
      id: 4,
      name: "Mirae Asset Emerging Bluechip Fund",
      amc: "Mirae Asset",
      category: "Large & Mid Cap",
      nav: 89.34,
      prevNav: 88.76,
      change1d: 0.65,
      change1w: 2.1,
      change1m: 1.9,
      change1y: 20.3,
      expenseRatio: 1.18,
      aum: "₹34,567 Cr",
      isInPortfolio: false
    }
  ];

  const recommendedFunds = [
    {
      name: "Parag Parikh Flexi Cap Fund",
      category: "Flexi Cap",
      returns1y: 19.8,
      reason: "Based on your portfolio diversification"
    },
    {
      name: "HDFC Index Fund - Nifty 50",
      category: "Index Fund",
      returns1y: 16.2,
      reason: "Low cost passive investing option"
    },
    {
      name: "Kotak Emerging Equity Fund",
      category: "Mid Cap",
      returns1y: 24.1,
      reason: "High growth potential mid-cap exposure"
    }
  ];

  const formatChange = (change: number) => {
    const isPositive = change > 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Fund Watchlist
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Track and analyze your favorite mutual funds
          </p>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search funds by name, AMC, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Fund
            </Button>
          </div>
        </div>

        <Tabs defaultValue="watchlist" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="watchlist">My Watchlist</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="alerts">Price Alerts</TabsTrigger>
          </TabsList>

          {/* Watchlist Tab */}
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fund Name</TableHead>
                        <TableHead>NAV</TableHead>
                        <TableHead>1D Change</TableHead>
                        <TableHead>1W</TableHead>
                        <TableHead>1M</TableHead>
                        <TableHead>1Y</TableHead>
                        <TableHead>Expense Ratio</TableHead>
                        <TableHead>AUM</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watchlistFunds.map((fund) => (
                        <TableRow key={fund.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fund.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center">
                                <span>{fund.amc}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {fund.category}
                                </Badge>
                                {fund.isInPortfolio && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    In Portfolio
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">₹{fund.nav.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">
                                Prev: ₹{fund.prevNav.toFixed(2)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatChange(fund.change1d)}
                          </TableCell>
                          <TableCell>
                            {formatChange(fund.change1w)}
                          </TableCell>
                          <TableCell>
                            {formatChange(fund.change1m)}
                          </TableCell>
                          <TableCell>
                            {formatChange(fund.change1y)}
                          </TableCell>
                          <TableCell>{fund.expenseRatio}%</TableCell>
                          <TableCell>{fund.aum}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Bell className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommended Tab */}
          <TabsContent value="recommended" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Funds You Might Like</CardTitle>
                <CardDescription>
                  AI-powered recommendations based on your portfolio and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedFunds.map((fund, index) => (
                    <Card key={index} className="hover:shadow-strong transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{fund.name}</CardTitle>
                            <Badge variant="outline" className="mt-2">
                              {fund.category}
                            </Badge>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Star className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">1Y Returns</span>
                            <span className="font-semibold text-success">
                              +{fund.returns1y}%
                            </span>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Why recommended:</strong> {fund.reason}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="flex-1">
                              <Plus className="h-4 w-4 mr-1" />
                              Add to Watchlist
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Price Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Alerts</CardTitle>
                <CardDescription>
                  Set up notifications for NAV movements and market events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Active Alerts
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Create price alerts to stay informed about your favorite funds
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default Watchlist;