
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

// Type definitions for your data
interface Invoice {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: { _id: string; name: string } | null;
  }[];
  companyDetails: {
    name: string;
    address: string;
    cityState: string;
    phone: string;
    email: string;
  };
  createdAt: string;
}

interface Item {
  _id: string;
  name: string;
  category: { _id: string; name: string } | null;
  quantity: number;
  price: number;
}

interface MonthlyBill {
  month: string;
  count: number;
}

interface CategorySale {
  categoryName: string;
  totalSold: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ totalBills: number; totalAmount: number }>({ totalBills: 0, totalAmount: 0 });
  const [monthlyBills, setMonthlyBills] = useState<MonthlyBill[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySale[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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

  useEffect(() => {
    // Fetch invoices
    axios.get<Invoice[]>('http://localhost:3000/invoice')
      .then(response => {
        setInvoices(response.data);
      })
      .catch(error => console.error('Error fetching invoices:', error));

    // Fetch low stock items
    axios.get<Item[]>('http://localhost:3000/item')
      .then(response => {
        const lowStock = response.data.filter(item => item.quantity < 10);
        setLowStockItems(lowStock);
      })
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  useEffect(() => {
    // Process filtered invoices
    const filteredInvoices = filterInvoices(invoices, filter);

    // Update stats
    const totalBills = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((sum, invoice) =>
      sum + invoice.items.reduce((itemSum, item) => itemSum + (item.quantity * item.price), 0), 0);
    setStats({ totalBills, totalAmount });

    // Update monthly bills
    const monthlyData = filteredInvoices.reduce((acc, invoice) => {
      const date = new Date(invoice.invoiceDate);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    const formattedMonthlyData = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));
    setMonthlyBills(formattedMonthlyData);

    // Update category sales
    const categoryData = filteredInvoices.reduce((acc, invoice) => {
      invoice.items.forEach(item => {
        const categoryName = item.category?.name || 'Unknown';
        acc[categoryName] = (acc[categoryName] || 0) + item.quantity;
      });
      return acc;
    }, {} as { [key: string]: number });
    const formattedCategoryData = Object.entries(categoryData).map(([categoryName, totalSold]) => ({
      categoryName,
      totalSold
    }));
    setCategorySales(formattedCategoryData);
  }, [invoices, filter]);

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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <div>
          <label htmlFor="filter" className="mr-2 text-lg">Filter by:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
            <option value="Week">Week</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Bills</h2>
          <p className="text-3xl">{stats.totalBills}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold">Total Amount</h2>
          <p className="text-3xl">Rs.{stats.totalAmount.toFixed(2)}/-</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Bills</h2>
          <Bar
            data={barChartData}
            options={{
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Category Sales</h2>
          <Pie data={pieChartData} />
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Low Stock Items (Quantity &lt; 10)</h2>
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map(item => (
              <tr key={item._id} className="border-b text-center">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2">{item.category?.name || 'N/A'}</td>
                <td className="px-4 py-2">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;