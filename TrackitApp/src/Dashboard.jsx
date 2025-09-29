import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF6666"];

// ISO Week calculation
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function groupTransactions(transactions, mode = "monthly") {
  const grouped = {};
  transactions.forEach((t) => {
    const date = new Date(t.timestamp);
    let key;
    if (mode === "daily") key = date.toLocaleDateString();
    else if (mode === "weekly") key = getISOWeek(date);
    else if (mode === "yearly") key = date.getFullYear().toString();
    else key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped[key]) grouped[key] = { period: key, income: 0, expense: 0 };
    grouped[key][t.type] += t.amount;
  });
  return Object.values(grouped).sort((a, b) => (a.period > b.period ? 1 : -1));
}

// Helper to get month:year strings from transactions
function getMonthYearOptions(transactions) {
  const months = new Set();
  transactions.forEach((t) => {
    const date = new Date(t.timestamp);
    const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}:${date.getFullYear()}`;
    months.add(monthYear);
  });
  return ["all", ...Array.from(months).sort((a, b) => {
    const [aM, aY] = a.split(":").map(Number);
    const [bM, bY] = b.split(":").map(Number);
    if (aY !== bY) return aY - bY;
    return aM - bM;
  })];
}

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [timeView, setTimeView] = useState("monthly");
  const [sortConfig, setSortConfig] = useState({ key: "timestamp", direction: "desc" });
  const [filterMonth, setFilterMonth] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          "https://zmql9x21lc.execute-api.us-east-1.amazonaws.com/dev/transactions?userId=test-user-123"
        );
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // --- Filter Transactions by month:year ---
  const filteredTransactions = transactions.filter((tx) => {
    if (filterMonth === "all") return true;
    const date = new Date(tx.timestamp);
    const monthYear = `${String(date.getMonth() + 1).padStart(2, "0")}:${date.getFullYear()}`;
    return monthYear === filterMonth;
  });

  // --- Donut Chart Data ---
  const categoryData = Object.values(
    filteredTransactions.reduce((acc, tx) => {
      if (tx.type !== "expense") return acc;
      if (!acc[tx.category]) acc[tx.category] = { name: tx.category, value: 0 };
      acc[tx.category].value += tx.amount;
      return acc;
    }, {})
  );

  // --- Bar Chart ---
  const barData = groupTransactions(transactions, timeView);
  const maxValue = Math.max(...barData.map(d => Math.max(d.income, d.expense)));

  // --- Transaction Table Sorting ---
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aKey = a[sortConfig.key];
    let bKey = b[sortConfig.key];
    if (sortConfig.key === "timestamp") { aKey = new Date(aKey); bKey = new Date(bKey); }
    if (aKey < bKey) return sortConfig.direction === "asc" ? -1 : 1;
    if (aKey > bKey) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const monthOptions = getMonthYearOptions(transactions);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <Link to="/">Back to Add Transaction</Link>

      {/* Donut Chart */}
      <h2>Spending by Category</h2>
      <label>View: </label>
      <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
        {monthOptions.map((m) => (
          <option key={m} value={m}>{m === "all" ? "All" : m}</option>
        ))}
      </select>
      <PieChart width={400} height={300}>
        <Pie
          data={categoryData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          label
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>

      {/* Bar Chart */}
      <h2>Income vs Expenses</h2>
      <label>View by: </label>
      <select value={timeView} onChange={(e) => setTimeView(e.target.value)}>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <BarChart width={600} height={300} data={barData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis domain={[0, maxValue * 1.1]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#4CAF50" barSize={20} />
        <Bar dataKey="expense" fill="#F44336" barSize={20} />
      </BarChart>

      {/* Transactions List */}
      <h2>Transactions</h2>
      <label>View: </label>
      <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
        {monthOptions.map((m) => (
          <option key={m} value={m}>{m === "all" ? "All" : m}</option>
        ))}
      </select>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th onClick={() => requestSort("timestamp")}>Date</th>
            <th onClick={() => requestSort("category")}>Category</th>
            <th onClick={() => requestSort("type")}>Type</th>
            <th onClick={() => requestSort("amount")}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((tx, idx) => (
            <tr key={idx}>
              <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
              <td>{tx.category}</td>
              <td>{tx.type}</td>
              <td>{tx.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;