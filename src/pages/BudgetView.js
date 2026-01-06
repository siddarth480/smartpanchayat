import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  ArrowUpRight,
  Clock,
  Calendar,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BudgetView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "villageBudget"),
      where("status", "==", "approved"),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(data);

      let inc = 0;
      let exp = 0;
      const categories = {};

      data.forEach((item) => {
        const val = Number(item.amount);
        if (item.type === "income") {
          inc += val;
        } else {
          exp += val;
          categories[item.category] = (categories[item.category] || 0) + val;
        }
      });

      const formattedPieData = Object.keys(categories).map((key) => ({
        name: key,
        value: categories[key],
      }));

      setCategoryData(formattedPieData);
      setTotals({ income: inc, expense: exp });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const balance = totals.income - totals.expense;
  const utilizationRate =
    totals.income > 0 ? ((totals.expense / totals.income) * 100).toFixed(1) : 0;

  const barData = [
    { name: "Total Funds", amount: totals.income },
    { name: "Total Spent", amount: totals.expense },
  ];

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#8b5cf6",
  ];

  if (loading)
    return (
      <div style={styles.loader}>
        <Clock className="animate-spin" size={40} color="#2563eb" />
        <p>Loading Transparency Dashboard...</p>
      </div>
    );

  return (
    <div style={styles.pageWrapper}>
      {/* 📱 Mobile Responsiveness Fix via CSS-in-JS */}
      <style>
        {`
          @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr !important; }
            .chart-section { grid-template-columns: 1fr !important; }
            .header-flex { flex-direction: column !important; align-items: flex-start !important; gap: 15px; }
            .chart-card { padding: 15px !important; }
            .recharts-legend-wrapper { font-size: 10px !important; position: relative !important; }
          }
        `}
      </style>

      <div style={styles.container}>
        {/* Header */}
        <header className="header-flex" style={styles.header}>
          <div>
            <h1 style={styles.title}>Village Budget Transparency</h1>
            <p style={styles.subtitle}>
              Real-time tracking of public funds and expenditures
            </p>
          </div>
          <div style={styles.lastUpdate}>
            <Calendar size={14} /> Updated: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* 1. Statistics Row */}
        <div className="stats-grid" style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{ ...styles.iconCircle, background: "#ecfdf5" }}>
              <TrendingUp color="#10b981" />
            </div>
            <div>
              <p style={styles.statLabel}>Total Income</p>
              <h2 style={styles.statValue}>
                ₹{totals.income.toLocaleString()}
              </h2>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={{ ...styles.iconCircle, background: "#fef2f2" }}>
              <TrendingDown color="#ef4444" />
            </div>
            <div>
              <p style={styles.statLabel}>Total Expenditure</p>
              <h2 style={styles.statValue}>
                ₹{totals.expense.toLocaleString()}
              </h2>
            </div>
          </div>

          <div
            style={{ ...styles.statCard, background: "#1e293b", color: "#fff" }}
          >
            <div
              style={{
                ...styles.iconCircle,
                background: "rgba(255,255,255,0.1)",
              }}
            >
              <Wallet color="#fff" />
            </div>
            <div>
              <p style={{ ...styles.statLabel, color: "#94a3b8" }}>
                Available Balance
              </p>
              <h2 style={{ ...styles.statValue, color: "#fff" }}>
                ₹{balance.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        {/* 📊 2. Visual Analytics Section */}
        <div className="chart-section" style={styles.chartSection}>
          <div className="chart-card" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              <BarChart3 size={18} /> Fund Flow Overview
            </h3>
            <div style={{ height: "300px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: 2, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#6366f1" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card" style={styles.chartCard}>
            <h3 style={styles.chartTitle}>
              <PieIcon size={18} /> Expense by Category
            </h3>
            <div style={{ height: "300px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 3. Budget Utilization Bar */}
        <div style={styles.progressCard}>
          <div style={styles.progressHeader}>
            <span>Budget Utilization Rate</span>
            <span>{utilizationRate}% spent</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${Math.min(utilizationRate, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* 4. Transaction List */}
        <div style={styles.tableSection}>
          <h3 style={styles.sectionTitle}>
            <FileText size={20} /> Verified Transactions
          </h3>

          {items.length === 0 ? (
            <div style={styles.empty}>No records found.</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}>
                        {new Date(
                          item.date?.seconds * 1000
                        ).toLocaleDateString()}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryTag}>{item.category}</span>
                      </td>
                      <td style={styles.td}>{item.description}</td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: "700",
                          color: item.type === "income" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {item.type === "income" ? "+" : "-"} ₹
                        {Number(item.amount).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        {item.receiptUrl ? (
                          <a
                            href={item.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.receiptLink}
                          >
                            Receipt <ArrowUpRight size={14} />
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>No File</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    paddingTop: "120px",
    paddingBottom: "60px",
    fontFamily: "'Inter', sans-serif",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
  },
  title: { fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { fontSize: "15px", color: "#64748b", marginTop: "5px" },
  lastUpdate: {
    fontSize: "12px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#fff",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
  },
  iconCircle: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    margin: 0,
  },
  statValue: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "2px 0 0 0",
  },
  chartSection: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    marginBottom: "40px",
  },
  chartCard: {
    background: "#fff",
    padding: "25px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  progressCard: {
    background: "#fff",
    padding: "20px 30px",
    borderRadius: "20px",
    border: "1px solid #e2e8f0",
    marginBottom: "40px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "10px",
  },
  progressBarBg: {
    height: "10px",
    background: "#f1f5f9",
    borderRadius: "10px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #2563eb)",
    borderRadius: "10px",
    transition: "width 1s ease-in-out",
  },
  tableSection: {
    background: "#fff",
    padding: "25px",
    borderRadius: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.02)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 15px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    borderBottom: "1px solid #f1f5f9",
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "15px", fontSize: "13px", color: "#334155" },
  categoryTag: {
    background: "#f1f5f9",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#475569",
  },
  receiptLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
  loader: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#64748b",
  },
  empty: { textAlign: "center", padding: "40px", color: "#94a3b8" },
};

export default BudgetView;
