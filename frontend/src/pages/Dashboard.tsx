import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { BarChart, Receipt, IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/lib/formatCurrency';
import { useAuth } from '@/contexts/AuthContext';

// React Query hooks
import {
  useInvoices,
  useLowStockItems,
  useDashboardStats,
  type Invoice,
  type Product
} from '@/hooks/useApi';
import { AuthDebug } from '@/components/AuthDebug';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyBill {
  month: string;
  count: number;
}

interface CategorySale {
  categoryName: string;
  totalSold: number;
}

const Dashboard: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  // React Query hooks
  const { data: invoices = [], isLoading: isLoadingInvoices, error: invoicesError } = useInvoices();
  const { data: lowStockItems = [], isLoading: isLoadingLowStock } = useLowStockItems();
  const { data: dashboardStats, isLoading: isLoadingStats } = useDashboardStats();

  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  // Handle loading and error states
  const isLoading = isAuthLoading || isLoadingInvoices || isLoadingLowStock || isLoadingStats;

  // Show loading while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show unauthorized if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-destructive">Unauthorized: Admin access required</div>
      </div>
    );
  }

  if (invoicesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Error loading dashboard data</div>
          <div className="text-sm text-gray-600">
            {invoicesError?.message || "Unknown error occurred"}
          </div>
        </div>
      </div>
    );
  }

  // Function to filter invoices based on the selected time period
  const filterInvoices = (invoices: Invoice[], period: string): Invoice[] => {
    const now = new Date();
    switch (period) {
      case 'Month':
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return invoices.filter(invoice => {
          const date = new Date(invoice.invoiceDate);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      case 'Year':
        return invoices.filter(invoice => {
          const date = new Date(invoice.invoiceDate);
          return date.getFullYear() === now.getFullYear();
        });
      case 'Week':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return invoices.filter(invoice => {
          const date = new Date(invoice.invoiceDate);
          return date >= oneWeekAgo && date <= now;
        });
      case 'All':
      default:
        return invoices;
    }
  };

  // Get filtered data
  const filteredInvoices = filterInvoices(invoices, filter);
  const stats = {
    totalBills: filteredInvoices.length,
    totalAmount: filteredInvoices.reduce((sum, invoice) =>
      sum + invoice.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0), 0)
  };

  // Process filtered invoices for charts
  const monthlyData = filteredInvoices.reduce((acc, invoice) => {
    const date = new Date(invoice.invoiceDate);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const monthlyBills = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

  const categoryData = filteredInvoices.reduce((acc, invoice) => {
    invoice.items.forEach(item => {
      // Handle both string categories and populated category objects
      const categoryName = typeof item.category === 'string'
        ? item.category
        : (item.category as any)?.name || 'Unknown';
      acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
    });
    return acc;
  }, {} as { [key: string]: number });

  const categorySales = Object.entries(categoryData).map(([categoryName, totalSold]) => ({
    categoryName,
    totalSold
  }));

  const barChartData = {
    labels: monthlyBills.map(item => item.month),
    datasets: [{
      label: 'Bills Generated',
      data: monthlyBills.map(item => item.count),
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const pieChartData = {
    labels: categorySales.map(item => item.categoryName),
    datasets: [{
      data: categorySales.map(item => item.totalSold),
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Filtered low stock items based on search
  const filteredLowStockItems = lowStockItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    (item.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen dark:bg-black bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Temporary Debug Panel */}
        {/* <AuthDebug /> */}

        {/* Filter Dropdown */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Label htmlFor="filter">Filter by:</Label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32" id="filter">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Year">Year</SelectItem>
                <SelectItem value="Week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Receipt className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle>Total Bills</CardTitle>
                <CardDescription>Number of bills generated in the selected period</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-blue-700">{stats.totalBills}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <IndianRupee className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <CardTitle>Total Amount</CardTitle>
                <CardDescription>Total revenue in the selected period</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-700">Rs.{formatCurrency(stats.totalAmount)}/-</span>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-500" /> Monthly Bills</CardTitle>
              <CardDescription>Bills generated per month</CardDescription>
            </CardHeader>
            <CardContent className="min-h-64">
              <Bar
                data={barChartData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Category Sales</CardTitle>
              <CardDescription>Sales distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="h-72 w-full">
              <Pie data={pieChartData} />
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <CardTitle>Low Stock Items (Quantity &lt; 10)</CardTitle>
            <Input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-400">No items found.</TableCell>
                  </TableRow>
                ) : (
                  filteredLowStockItems.map(item => (
                    <TableRow key={item._id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.quantity}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;