import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileText, 
  Download, 
  Calendar, 
  PieChart,
  TrendingUp,
  DollarSign,
  Receipt,
  Eye,
  Filter,
  BarChart3
} from "lucide-react";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");

  const dividendHistory = [
    {
      date: "2024-03-15",
      fundName: "ICICI Prudential Bluechip Fund",
      dividendPerUnit: 2.50,
      unitsHeld: 1000,
      totalDividend: 2500,
      tdsDeducted: 250,
      netAmount: 2250
    },
    {
      date: "2024-02-20",
      fundName: "SBI Large & Midcap Fund",
      dividendPerUnit: 1.80,
      unitsHeld: 800,
      totalDividend: 1440,
      tdsDeducted: 144,
      netAmount: 1296
    },
    {
      date: "2024-01-10",
      fundName: "Axis Midcap Fund",
      dividendPerUnit: 3.20,
      unitsHeld: 500,
      totalDividend: 1600,
      tdsDeducted: 160,
      netAmount: 1440
    }
  ];

  const capitalGains = [
    {
      date: "2024-03-20",
      fundName: "Mirae Asset Emerging Bluechip Fund",
      transactionType: "Redemption",
      units: 200,
      costPrice: 75.50,
      salePrice: 89.30,
      gain: 2760,
      gainType: "LTCG",
      taxRate: "10%",
      taxLiability: 276
    },
    {
      date: "2024-02-15",
      fundName: "Kotak Small Cap Fund",
      transactionType: "Switch",
      units: 150,
      costPrice: 145.20,
      salePrice: 156.80,
      gain: 1740,
      gainType: "STCG",
      taxRate: "15%",
      taxLiability: 261
    }
  ];

  const portfolioReports = [
    {
      name: "Portfolio Statement - March 2024",
      type: "Monthly Statement",
      date: "2024-03-31",
      size: "2.1 MB",
      status: "Available"
    },
    {
      name: "Annual Portfolio Report - FY 2023-24",
      type: "Annual Report",
      date: "2024-03-31",
      size: "5.8 MB",
      status: "Available"
    },
    {
      name: "Tax Statement - FY 2023-24",
      type: "Tax Document",
      date: "2024-03-31",
      size: "1.2 MB",
      status: "Available"
    },
    {
      name: "Transaction Statement - Q4 FY24",
      type: "Transaction Report",
      date: "2024-03-31",
      size: "3.5 MB",
      status: "Available"
    }
  ];

  const summaryStats = {
    totalDividends: 5586,
    totalTDS: 554,
    netDividends: 5032,
    totalCapitalGains: 4500,
    ltcgTax: 276,
    stcgTax: 261,
    totalTaxLiability: 537
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Reports & Analysis
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Comprehensive portfolio reports and tax documents
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-success/10 p-2 rounded-lg mr-3">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Dividends</p>
                    <p className="text-lg font-semibold">₹{summaryStats.totalDividends.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capital Gains</p>
                    <p className="text-lg font-semibold">₹{summaryStats.totalCapitalGains.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-warning/10 p-2 rounded-lg mr-3">
                    <Receipt className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Liability</p>
                    <p className="text-lg font-semibold">₹{summaryStats.totalTaxLiability.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="bg-secondary/10 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-lg font-semibold">{portfolioReports.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="dividends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dividends">Dividend Reports</TabsTrigger>
            <TabsTrigger value="capital-gains">Capital Gains</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Reports</TabsTrigger>
            <TabsTrigger value="tax">Tax Documents</TabsTrigger>
          </TabsList>

          {/* Dividend Reports Tab */}
          <TabsContent value="dividends" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dividend Income Tracking</CardTitle>
                    <CardDescription>
                      Track all dividend payments and TDS deductions
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Dividends (YTD)</p>
                      <p className="text-2xl font-bold text-success">₹{summaryStats.totalDividends.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-warning/5 border-warning/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">TDS Deducted</p>
                      <p className="text-2xl font-bold text-warning">₹{summaryStats.totalTDS.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Net Amount</p>
                      <p className="text-2xl font-bold text-primary">₹{summaryStats.netDividends.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Fund Name</TableHead>
                        <TableHead>Dividend/Unit</TableHead>
                        <TableHead>Units Held</TableHead>
                        <TableHead>Total Dividend</TableHead>
                        <TableHead>TDS Deducted</TableHead>
                        <TableHead>Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dividendHistory.map((dividend, index) => (
                        <TableRow key={index}>
                          <TableCell>{dividend.date}</TableCell>
                          <TableCell className="font-medium">{dividend.fundName}</TableCell>
                          <TableCell>₹{dividend.dividendPerUnit.toFixed(2)}</TableCell>
                          <TableCell>{dividend.unitsHeld.toLocaleString()}</TableCell>
                          <TableCell>₹{dividend.totalDividend.toLocaleString()}</TableCell>
                          <TableCell className="text-warning">₹{dividend.tdsDeducted.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold text-success">₹{dividend.netAmount.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capital Gains Tab */}
          <TabsContent value="capital-gains" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Capital Gains Analysis</CardTitle>
                    <CardDescription>
                      Track realized and unrealized capital gains for tax planning
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="bg-success/5 border-success/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Realized Gains</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Long-term (LTCG)</span>
                        <span className="font-semibold">₹2,760</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Short-term (STCG)</span>
                        <span className="font-semibold">₹1,740</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Realized</span>
                        <span className="font-bold text-success">₹{summaryStats.totalCapitalGains.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-warning/5 border-warning/20">
                    <CardHeader>
                      <CardTitle className="text-lg">Tax Implications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">LTCG Tax (10%)</span>
                        <span className="font-semibold">₹276</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">STCG Tax (15%)</span>
                        <span className="font-semibold">₹261</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Total Tax</span>
                        <span className="font-bold text-warning">₹{summaryStats.totalTaxLiability.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Fund Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Units</TableHead>
                        <TableHead>Cost Price</TableHead>
                        <TableHead>Sale Price</TableHead>
                        <TableHead>Gain/Loss</TableHead>
                        <TableHead>Tax Type</TableHead>
                        <TableHead>Tax Liability</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capitalGains.map((gain, index) => (
                        <TableRow key={index}>
                          <TableCell>{gain.date}</TableCell>
                          <TableCell className="font-medium">{gain.fundName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{gain.transactionType}</Badge>
                          </TableCell>
                          <TableCell>{gain.units}</TableCell>
                          <TableCell>₹{gain.costPrice.toFixed(2)}</TableCell>
                          <TableCell>₹{gain.salePrice.toFixed(2)}</TableCell>
                          <TableCell className="text-success">₹{gain.gain.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={gain.gainType === 'LTCG' ? 'secondary' : 'destructive'}>
                              {gain.gainType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-warning">₹{gain.taxLiability.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Reports Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Documents</CardTitle>
                <CardDescription>
                  Download your portfolio statements and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolioReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.date}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{report.status}</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Documents Tab */}
          <TabsContent value="tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>
                  Access all tax-related documents and certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Form 16A</h3>
                      <p className="text-muted-foreground mb-4">
                        TDS certificates for dividend income
                      </p>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Capital Gains Statement</h3>
                      <p className="text-muted-foreground mb-4">
                        Detailed capital gains for ITR filing
                      </p>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
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

export default Reports;