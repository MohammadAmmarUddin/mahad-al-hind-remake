import { useState, useEffect, useCallback } from "react";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaBalanceScale,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCalendarAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaChartBar,
  FaChartPie,
  FaPiggyBank,
  FaRedo,
  FaFileInvoice,
  FaExchangeAlt,
  FaBullseye,
  FaSyncAlt,
  FaUsers,
} from "react-icons/fa";
import { TbCurrencyTaka } from "react-icons/tb";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { API } from "../../../config/api";
import { getStoredAuthToken } from "../../../utils/authToken";
import Swal from "sweetalert2";

const CURRENCIES = [
  { code: "BDT", symbol: "\u09F3", name: "Bangladeshi Taka" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Education",
  "Medical",
  "Bills",
  "Rent",
  "Entertainment",
  "Other",
];

const INCOME_SOURCES = [
  "Salary",
  "Freelancing",
  "Business",
  "Bonus",
  "Investment",
  "Other",
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "bKash", label: "bKash" },
  { value: "Nagad", label: "Nagad" },
  { value: "GooglePay", label: "Google Pay" },
  { value: "PhonePe", label: "PhonePe" },
];

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"];

const COLORS = ["#059669", "#dc2626", "#2563eb", "#d97706", "#7c3aed", "#0891b2", "#be185d", "#65a30d", "#ea580c"];

const getSymbol = (code) => CURRENCIES.find((c) => c.code === code)?.symbol || code;

const FinanceOverview = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const token = getStoredAuthToken();
  const authHeaders = token
    ? { Authorization: `Bearer ${token}`, "x-access-token": token, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <FaWallet /> },
    { id: "transactions", label: "Transactions", icon: <FaExchangeAlt /> },
    { id: "budgets", label: "Budgets", icon: <FaBullseye /> },
    { id: "savings", label: "Savings Goals", icon: <FaPiggyBank /> },
    { id: "recurring", label: "Recurring", icon: <FaSyncAlt /> },
    { id: "incomeSources", label: "Income Sources", icon: <FaUsers /> },
    { id: "reports", label: "Reports", icon: <FaFileInvoice /> },
  ];

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Finance Management</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "dashboard" && <FinanceDashboard token={token} authHeaders={authHeaders} />}
      {activeTab === "transactions" && <FinanceTransactions token={token} authHeaders={authHeaders} />}
      {activeTab === "budgets" && <FinanceBudgets token={token} authHeaders={authHeaders} />}
      {activeTab === "savings" && <FinanceSavings token={token} authHeaders={authHeaders} />}
      {activeTab === "recurring" && <FinanceRecurring token={token} authHeaders={authHeaders} />}
      {activeTab === "incomeSources" && <FinanceIncomeSources token={token} authHeaders={authHeaders} />}
      {activeTab === "reports" && <FinanceReports token={token} authHeaders={authHeaders} />}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
const FinanceDashboard = ({ token, authHeaders }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/finance/dashboard?month=${month}&year=${year}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.data || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year, authHeaders]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      {/* Month Selector */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => (month === 1 ? (setMonth(12), setYear(year - 1)) : setMonth(month - 1))} className="btn btn-sm btn-ghost">
          <FaChevronLeft />
        </button>
        <span className="text-lg font-semibold">
          {monthNames[month]} {year}
        </span>
        <button onClick={() => (month === 12 ? (setMonth(1), setYear(year + 1)) : setMonth(month + 1))} className="btn btn-sm btn-ghost">
          <FaChevronRight />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-emerald-100 text-sm font-medium">Total Income</h3>
            <FaArrowUp className="text-emerald-200" />
          </div>
          <p className="text-3xl font-bold">{summary?.totals?.income?.toLocaleString() || 0}</p>
          <p className="text-emerald-200 text-sm mt-1">This month</p>
        </div>
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-red-100 text-sm font-medium">Total Expense</h3>
            <FaArrowDown className="text-red-200" />
          </div>
          <p className="text-3xl font-bold">{summary?.totals?.expense?.toLocaleString() || 0}</p>
          <p className="text-red-200 text-sm mt-1">This month</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-blue-100 text-sm font-medium">Net Balance</h3>
            <FaBalanceScale className="text-blue-200" />
          </div>
          <p className="text-3xl font-bold">{summary?.totals?.balance?.toLocaleString() || 0}</p>
          <p className="text-blue-200 text-sm mt-1">This month</p>
        </div>
      </div>

      {/* Currency Breakdown */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {CURRENCIES.map((c) => {
          const data = summary?.currencies?.[c.code];
          if (!data || (data.income === 0 && data.expense === 0)) return null;
          return (
            <div key={c.code} className="bg-white rounded-lg border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{c.symbol}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{c.code}</h4>
                  <p className="text-xs text-gray-500">{c.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Income</p>
                  <p className="font-semibold text-emerald-600">{c.symbol}{data.income?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expense</p>
                  <p className="font-semibold text-red-600">{c.symbol}{data.expense?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className={`font-semibold ${data.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {c.symbol}{data.balance?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(!summary?.currencies || Object.values(summary.currencies).every((v) => v.income === 0 && v.expense === 0)) && (
        <div className="text-center py-12 text-gray-500">
          <FaWallet className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-lg">No financial data for this month</p>
          <p className="text-sm">Start adding transactions to see your dashboard</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// TRANSACTIONS TAB
// ═══════════════════════════════════════════════════════════
const FinanceTransactions = ({ token, authHeaders }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const perPage = 15;

  // Form state
  const [formType, setFormType] = useState("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("BDT");
  const [formCategory, setFormCategory] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formPaymentMethod, setFormPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (currencyFilter) params.append("currency", currencyFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "200");

      const res = await fetch(`${API}/api/finance/transactions?${params}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, currencyFilter, searchTerm, authHeaders]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const resetForm = () => {
    setFormType("expense");
    setFormAmount("");
    setFormCurrency("BDT");
    setFormCategory("");
    setFormSource("");
    setFormNote("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormPaymentMethod("cash");
    setEditingTx(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (tx) => {
    setFormType(tx.type);
    setFormAmount(tx.amount?.toString() || "");
    setFormCurrency(tx.currency || "BDT");
    setFormCategory(tx.category || "");
    setFormSource(tx.source || "");
    setFormNote(tx.note || "");
    setFormDate(tx.date ? new Date(tx.date).toISOString().split("T")[0] : "");
    setFormPaymentMethod(tx.paymentMethod || "cash");
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formAmount || Number(formAmount) <= 0) {
      Swal.fire({ icon: "warning", title: "Please enter a valid amount" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        type: formType,
        amount: Number(formAmount),
        currency: formCurrency,
        category: formType === "expense" ? formCategory : "",
        source: formType === "income" ? formSource : "",
        note: formNote,
        date: formDate,
        paymentMethod: formPaymentMethod,
      };

      const url = editingTx ? `${API}/api/finance/transactions/${editingTx._id}` : `${API}/api/finance/transactions`;
      const method = editingTx ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        Swal.fire({ icon: "success", title: editingTx ? "Updated" : "Created", timer: 1500, showConfirmButton: false });
        setShowForm(false);
        resetForm();
        fetchTransactions();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Transaction?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/api/finance/transactions/${id}`, { method: "DELETE", headers: authHeaders });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
        fetchTransactions();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  const filtered = transactions;
  const totalPages = Math.ceil(filtered.length / perPage);
  const currentItems = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select className="select select-bordered select-sm" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select className="select select-bordered select-sm" value={currencyFilter} onChange={(e) => { setCurrencyFilter(e.target.value); setCurrentPage(1); }}>
          <option value="">All Currencies</option>
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
          ))}
        </select>
        <button onClick={openCreate} className="btn btn-sm btn-primary text-white gap-2">
          <FaPlus /> Add Transaction
        </button>
        <button onClick={fetchTransactions} className="btn btn-sm btn-ghost gap-2">
          <FaRedo /> Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="grid grid-cols-12 bg-gray-50">
                <th className="col-span-1">Sl.</th>
                <th className="col-span-2">Type</th>
                <th className="col-span-2">Amount</th>
                <th className="col-span-2">Category/Source</th>
                <th className="col-span-1">Currency</th>
                <th className="col-span-1">Method</th>
                <th className="col-span-1">Date</th>
                <th className="col-span-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((tx, i) => (
                  <tr key={tx._id} className="grid grid-cols-12">
                    <td className="col-span-1">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="col-span-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        tx.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>
                        {tx.type === "income" ? <FaArrowUp /> : <FaArrowDown />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="col-span-2 font-semibold">
                      {getSymbol(tx.currency)}{tx.amount?.toLocaleString()}
                    </td>
                    <td className="col-span-2 truncate">{tx.type === "income" ? tx.source : tx.category}</td>
                    <td className="col-span-1">
                      <span className="badge badge-sm badge-outline">{tx.currency}</span>
                    </td>
                    <td className="col-span-1 text-xs capitalize">{tx.paymentMethod}</td>
                    <td className="col-span-1 text-xs">{tx.date ? new Date(tx.date).toLocaleDateString() : "-"}</td>
                    <td className="col-span-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(tx)} className="btn btn-xs btn-ghost text-primary">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(tx._id)} className="btn btn-xs btn-ghost text-red-600">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center py-8 text-slate-500">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="btn btn-sm btn-ghost">
              <FaChevronLeft />
            </button>
            {[...Array(totalPages)].slice(0, 10).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary text-white" : "btn-ghost"}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="btn btn-sm btn-ghost">
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">{editingTx ? "Edit Transaction" : "Add Transaction"}</h3>
            <form onSubmit={handleSubmit}>
              {/* Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setFormType("income")} className={`flex-1 py-2 rounded-lg font-semibold text-sm ${formType === "income" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Income
                </button>
                <button type="button" onClick={() => setFormType("expense")} className={`flex-1 py-2 rounded-lg font-semibold text-sm ${formType === "expense" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  Expense
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Amount</span></label>
                  <input type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" className="input input-bordered w-full" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Currency</span></label>
                  <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="select select-bordered w-full">
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                  </select>
                </div>
              </div>

              {formType === "expense" ? (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Category</span></label>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <button key={c} type="button" onClick={() => setFormCategory(c)} className={`px-3 py-1 rounded-full text-xs font-semibold ${formCategory === c ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Source</span></label>
                  <div className="flex flex-wrap gap-2">
                    {INCOME_SOURCES.map((s) => (
                      <button key={s} type="button" onClick={() => setFormSource(s)} className={`px-3 py-1 rounded-full text-xs font-semibold ${formSource === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Date</span></label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="input input-bordered w-full" />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Payment Method</span></label>
                  <select value={formPaymentMethod} onChange={(e) => setFormPaymentMethod(e.target.value)} className="select select-bordered w-full">
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Note (Optional)</span></label>
                <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} className="textarea textarea-bordered h-20" placeholder="Add a note..."></textarea>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary text-white">
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : editingTx ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => { setShowForm(false); resetForm(); }}>
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// BUDGETS TAB
// ═══════════════════════════════════════════════════════════
const FinanceBudgets = ({ token, authHeaders }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [currencyFilter, setCurrencyFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formLimit, setFormLimit] = useState("");
  const [formCurrency, setFormCurrency] = useState("BDT");
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ month, year });
      if (currencyFilter) params.append("currency", currencyFilter);
      const res = await fetch(`${API}/api/finance/budgets?${params}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year, currencyFilter, authHeaders]);

  useEffect(() => { fetchBudgets(); }, [fetchBudgets]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formCategory || !formLimit || Number(formLimit) <= 0) {
      Swal.fire({ icon: "warning", title: "Please fill all fields" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/finance/budgets`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ category: formCategory, limit: Number(formLimit), currency: formCurrency, month, year }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Budget created", timer: 1500, showConfirmButton: false });
        setShowForm(false);
        setFormCategory("");
        setFormLimit("");
        fetchBudgets();
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Delete Budget?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await fetch(`${API}/api/finance/budgets/${id}`, { method: "DELETE", headers: authHeaders });
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
      fetchBudgets();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  };

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => (month === 1 ? (setMonth(12), setYear(year - 1)) : setMonth(month - 1))} className="btn btn-sm btn-ghost"><FaChevronLeft /></button>
        <span className="font-semibold">{monthNames[month]} {year}</span>
        <button onClick={() => (month === 12 ? (setMonth(1), setYear(year + 1)) : setMonth(month + 1))} className="btn btn-sm btn-ghost"><FaChevronRight /></button>
        <select className="select select-bordered select-sm" value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}>
          <option value="">All Currencies</option>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} className="btn btn-sm btn-primary text-white gap-2"><FaPlus /> Add Budget</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaBullseye className="mx-auto text-4xl mb-4 text-gray-300" />
          <p className="text-lg">No budgets for this period</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((b) => {
            const pct = Math.min(100, b.percentage || 0);
            const color = pct >= 100 ? "error" : pct >= 80 ? "warning" : "success";
            return (
              <div key={b._id} className="bg-white rounded-lg border p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{b.category}</h4>
                    <span className="badge badge-sm badge-outline">{b.currency}</span>
                  </div>
                  <button onClick={() => handleDelete(b._id)} className="btn btn-xs btn-ghost text-red-600"><FaTrash /></button>
                </div>
                <progress className={`progress progress-${color} w-full`} value={pct} max="100"></progress>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">Spent: {getSymbol(b.currency)}{b.spent?.toLocaleString()}</span>
                  <span className="text-gray-500">Limit: {getSymbol(b.currency)}{b.limit?.toLocaleString()}</span>
                </div>
                <p className={`text-xs mt-1 text-${color}`}>{pct.toFixed(0)}% used</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create Budget</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Category</span></label>
                <div className="flex flex-wrap gap-2">
                  {EXPENSE_CATEGORIES.map((c) => (
                    <button key={c} type="button" onClick={() => setFormCategory(c)} className={`px-3 py-1 rounded-full text-xs font-semibold ${formCategory === c ? "bg-primary text-white" : "bg-gray-100"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Budget Limit</span></label>
                  <input type="number" step="0.01" min="0" value={formLimit} onChange={(e) => setFormLimit(e.target.value)} className="input input-bordered" placeholder="0.00" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Currency</span></label>
                  <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="select select-bordered">
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary text-white">
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setShowForm(false)}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// SAVINGS GOALS TAB
// ═══════════════════════════════════════════════════════════
const FinanceSavings = ({ token, authHeaders }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(null);
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrency, setFormCurrency] = useState("BDT");
  const [formDate, setFormDate] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/finance/savings`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setGoals(data.data || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formName || !formTarget || !formDate) {
      Swal.fire({ icon: "warning", title: "Please fill all fields" }); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/finance/savings`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({ name: formName, targetAmount: Number(formTarget), currency: formCurrency, targetDate: formDate }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Goal created", timer: 1500, showConfirmButton: false });
        setShowForm(false); setFormName(""); setFormTarget(""); setFormDate(""); fetchGoals();
      } else { const d = await res.json(); throw new Error(d.message); }
    } catch (err) { Swal.fire({ icon: "error", title: "Error", text: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleAddMoney = async (id) => {
    if (!addAmount || Number(addAmount) <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/finance/savings/${id}/add`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({ amount: Number(addAmount) }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Money added", timer: 1500, showConfirmButton: false });
        setShowAddMoney(null); setAddAmount(""); fetchGoals();
      }
    } catch (err) { Swal.fire({ icon: "error", title: "Error", text: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Delete Goal?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    await fetch(`${API}/api/finance/savings/${id}`, { method: "DELETE", headers: authHeaders });
    Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
    fetchGoals();
  };

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm(true)} className="btn btn-sm btn-primary text-white gap-2"><FaPlus /> Create Goal</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><FaPiggyBank className="mx-auto text-4xl mb-4 text-gray-300" /><p>No savings goals yet</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <div key={g._id} className="bg-white rounded-lg border p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{g.name}</h4>
                  <p className="text-xs text-gray-500">Target: {g.formattedTarget || `${getSymbol(g.currency)}${g.targetAmount?.toLocaleString()}`}</p>
                </div>
                <button onClick={() => handleDelete(g._id)} className="btn btn-xs btn-ghost text-red-600"><FaTrash /></button>
              </div>
              <progress className={`progress ${g.isCompleted ? "progress-success" : "progress-primary"} w-full`} value={g.percentage || 0} max="100"></progress>
              <div className="flex justify-between mt-2 text-sm">
                <span className="font-semibold text-primary">{getSymbol(g.currency)}{g.currentAmount?.toLocaleString()} saved</span>
                <span className="text-gray-500">{(g.percentage || 0).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{getSymbol(g.currency)}{g.remaining?.toLocaleString()} remaining</p>
              {!g.isCompleted && (
                <button onClick={() => { setShowAddMoney(g._id); setAddAmount(""); }} className="btn btn-sm btn-outline btn-primary w-full mt-3 gap-2">
                  <FaPlus /> Add Money
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create Savings Goal</h3>
            <form onSubmit={handleCreate}>
              <div className="form-control mb-4">
                <label className="label"><span className="label-text">Goal Name</span></label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className="input input-bordered" placeholder="e.g., New Laptop" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Target Amount</span></label>
                  <input type="number" step="0.01" min="0" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} className="input input-bordered" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Currency</span></label>
                  <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="select select-bordered">
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Target Date</span></label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="input input-bordered" required />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary text-white">
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setShowForm(false)}><button>close</button></form>
        </dialog>
      )}

      {/* Add Money Modal */}
      {showAddMoney && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add Money to Goal</h3>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Amount</span></label>
              <input type="number" step="0.01" min="0" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} className="input input-bordered" placeholder="0.00" />
            </div>
            <div className="modal-action">
              <button onClick={() => { setShowAddMoney(null); setAddAmount(""); }} className="btn btn-ghost">Cancel</button>
              <button onClick={() => handleAddMoney(showAddMoney)} disabled={submitting} className="btn btn-primary text-white">
                {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Add"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => { setShowAddMoney(null); setAddAmount(""); }}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// RECURRING TAB
// ═══════════════════════════════════════════════════════════
const FinanceRecurring = ({ token, authHeaders }) => {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("expense");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("BDT");
  const [formCategory, setFormCategory] = useState("");
  const [formSource, setFormSource] = useState("");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formDate, setFormDate] = useState("");
  const [formNote, setFormNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRecurring = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/finance/recurring`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setRecurring(data.data || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [authHeaders]);

  useEffect(() => { fetchRecurring(); }, [fetchRecurring]);

  const handleGenerate = async () => {
    const result = await Swal.fire({ title: "Generate due transactions?", icon: "question", showCancelButton: true, confirmButtonColor: "#059669", confirmButtonText: "Generate" });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API}/api/finance/recurring/generate`, { method: "POST", headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        Swal.fire({ icon: "success", title: `Generated ${data.generated || 0} transactions`, timer: 2000, showConfirmButton: false });
        fetchRecurring();
      }
    } catch (err) { Swal.fire({ icon: "error", title: "Error", text: err.message }); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formAmount || !formDate) { Swal.fire({ icon: "warning", title: "Please fill all fields" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/finance/recurring`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({
          type: formType, amount: Number(formAmount), currency: formCurrency,
          category: formType === "expense" ? formCategory : "",
          source: formType === "income" ? formSource : "",
          note: formNote, frequency: formFrequency, nextDueDate: formDate,
        }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Created", timer: 1500, showConfirmButton: false });
        setShowForm(false); fetchRecurring();
      } else { const d = await res.json(); throw new Error(d.message); }
    } catch (err) { Swal.fire({ icon: "error", title: "Error", text: err.message }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Delete?", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    await fetch(`${API}/api/finance/recurring/${id}`, { method: "DELETE", headers: authHeaders });
    fetchRecurring();
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-6">
        <button onClick={handleGenerate} className="btn btn-sm btn-outline btn-primary gap-2"><FaSyncAlt /> Generate Due</button>
        <button onClick={() => setShowForm(true)} className="btn btn-sm btn-primary text-white gap-2"><FaPlus /> Add Recurring</button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : recurring.length === 0 ? (
        <div className="text-center py-12 text-gray-500"><FaRedo className="mx-auto text-4xl mb-4 text-gray-300" /><p>No recurring transactions</p></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recurring.map((r) => (
            <div key={r._id} className="bg-white rounded-lg border p-5">
              <div className="flex justify-between items-start mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                  {r.type}
                </span>
                <button onClick={() => handleDelete(r._id)} className="btn btn-xs btn-ghost text-red-600"><FaTrash /></button>
              </div>
              <h4 className="font-semibold mt-2">{r.type === "income" ? (r.source || "Income") : (r.category || "Expense")}</h4>
              <p className="text-xl font-bold mt-1">{getSymbol(r.currency)}{r.amount?.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="badge badge-sm">{r.frequency}</span>
                <span>{r.currency}</span>
              </div>
              {r.nextDueDate && <p className="text-xs text-gray-500 mt-1">Next: {new Date(r.nextDueDate).toLocaleDateString()}</p>}
              <span className={`inline-block mt-2 text-xs font-semibold ${r.isActive ? "text-emerald-600" : "text-red-600"}`}>
                {r.isActive ? "Active" : "Paused"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">Add Recurring Transaction</h3>
            <form onSubmit={handleCreate}>
              <div className="flex gap-2 mb-4">
                <button type="button" onClick={() => setFormType("income")} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${formType === "income" ? "bg-emerald-600 text-white" : "bg-gray-100"}`}>Income</button>
                <button type="button" onClick={() => setFormType("expense")} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${formType === "expense" ? "bg-red-600 text-white" : "bg-gray-100"}`}>Expense</button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Amount</span></label>
                  <input type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="input input-bordered" required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Currency</span></label>
                  <select value={formCurrency} onChange={(e) => setFormCurrency(e.target.value)} className="select select-bordered">
                    {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Frequency</span></label>
                  <select value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)} className="select select-bordered">
                    {FREQUENCIES.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Next Due Date</span></label>
                  <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="input input-bordered" required />
                </div>
              </div>
              {formType === "expense" ? (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Category</span></label>
                  <div className="flex flex-wrap gap-2">
                    {EXPENSE_CATEGORIES.map((c) => (
                      <button key={c} type="button" onClick={() => setFormCategory(c)} className={`px-3 py-1 rounded-full text-xs font-semibold ${formCategory === c ? "bg-red-600 text-white" : "bg-gray-100"}`}>{c}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="form-control mb-4">
                  <label className="label"><span className="label-text">Source</span></label>
                  <div className="flex flex-wrap gap-2">
                    {INCOME_SOURCES.map((s) => (
                      <button key={s} type="button" onClick={() => setFormSource(s)} className={`px-3 py-1 rounded-full text-xs font-semibold ${formSource === s ? "bg-emerald-600 text-white" : "bg-gray-100"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-control mb-6">
                <label className="label"><span className="label-text">Note</span></label>
                <input type="text" value={formNote} onChange={(e) => setFormNote(e.target.value)} className="input input-bordered" placeholder="Optional note" />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary text-white">
                  {submitting ? <span className="loading loading-spinner loading-sm"></span> : "Create"}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop" onClick={() => setShowForm(false)}><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// REPORTS TAB
// ═══════════════════════════════════════════════════════════
const FinanceReports = ({ token, authHeaders }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [currencyFilter, setCurrencyFilter] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ month, year });
      if (currencyFilter) params.append("currency", currencyFilter);
      const res = await fetch(`${API}/api/finance/reports?${params}`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setReport(data.data || null);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [month, year, currencyFilter, authHeaders]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Prepare chart data
  const categoryData = (report?.topCategories || []).map((item) => ({
    name: item._id?.category || "Unknown",
    value: item.total,
  }));

  const sourceData = (report?.topSources || []).map((item) => ({
    name: item._id?.source || "Unknown",
    value: item.total,
  }));

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button onClick={() => (month === 1 ? (setMonth(12), setYear(year - 1)) : setMonth(month - 1))} className="btn btn-sm btn-ghost"><FaChevronLeft /></button>
        <span className="font-semibold">{monthNames[month]} {year}</span>
        <button onClick={() => (month === 12 ? (setMonth(1), setYear(year + 1)) : setMonth(month + 1))} className="btn btn-sm btn-ghost"><FaChevronRight /></button>
        <select className="select select-bordered select-sm" value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}>
          <option value="">All Currencies</option>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : !report ? (
        <div className="text-center py-12 text-gray-500"><FaFileInvoice className="mx-auto text-4xl mb-4 text-gray-300" /><p>No report data</p></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Summary */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FaChartBar className="text-primary" /> Summary</h3>
            {report.summary?.length > 0 ? (
              <div className="space-y-3">
                {report.summary.map((item, i) => {
                  const isIncome = item._id?.type === "income";
                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncome ? "bg-emerald-100" : "bg-red-100"}`}>
                          {isIncome ? <FaArrowUp className="text-emerald-600" /> : <FaArrowDown className="text-red-600" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{isIncome ? "Income" : "Expense"} ({item._id?.currency})</p>
                          <p className="text-xs text-gray-500">{item.count} transactions</p>
                        </div>
                      </div>
                      <span className={`font-bold ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                        {getSymbol(item._id?.currency || "BDT")}{item.total?.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data</p>
            )}
          </div>

          {/* Top Spending Categories */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FaChartPie className="text-red-500" /> Top Spending</h3>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {categoryData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">No expense data</p>
            )}
          </div>

          {/* Top Income Sources */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FaChartBar className="text-emerald-500" /> Income Sources</h3>
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-4">No income data</p>
            )}
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FaCalendarAlt className="text-blue-500" /> Daily Breakdown</h3>
            {report.dailyBreakdown?.length > 0 ? (() => {
              const grouped = {};
              report.dailyBreakdown.forEach((item) => {
                const day = item._id?.day;
                if (!grouped[day]) grouped[day] = { day, income: 0, expense: 0 };
                if (item._id?.type === "income") grouped[day].income = item.total;
                else grouped[day].expense = item.total;
              });
              const chartData = Object.values(grouped).sort((a, b) => a.day - b.day);
              return (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#059669" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#dc2626" name="Expense" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              );
            })() : (
              <p className="text-gray-500 text-center py-4">No daily data</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// INCOME SOURCES TAB
// ═══════════════════════════════════════════════════════════
const FinanceIncomeSources = ({ token, authHeaders }) => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/finance/income-sources`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setSources(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  const openAdd = () => { setEditing(null); setForm({ name: "", description: "" }); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || "" }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return Swal.fire("Error", "Name is required", "error");
    try {
      const method = editing ? "PATCH" : "POST";
      const url = editing ? `${API}/api/finance/income-sources/${editing._id}` : `${API}/api/finance/income-sources`;
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(form) });
      if (res.ok) {
        setShowModal(false);
        fetchSources();
        Swal.fire("Success", editing ? "Source updated" : "Source added", "success");
      } else {
        const err = await res.json();
        Swal.fire("Error", err.message || "Failed", "error");
      }
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({ title: "Delete source?", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch(`${API}/api/finance/income-sources/${id}`, { method: "DELETE", headers: authHeaders });
      if (res.ok) { fetchSources(); Swal.fire("Deleted", "", "success"); }
    } catch (e) {
      Swal.fire("Error", e.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Income Sources</h2>
        <button onClick={openAdd} className="btn btn-primary btn-sm gap-2"><FaPlus /> Add Source</button>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FaUsers className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>No income sources yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <div key={s._id} className="bg-white rounded-lg border p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{s.name}</h3>
                  {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                </div>
                <span className={`badge ${s.isActive ? "badge-success" : "badge-ghost"} badge-sm`}>
                  {s.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={() => openEdit(s)} className="btn btn-outline btn-sm btn-info flex-1 gap-1"><FaEdit /> Edit</button>
                <button onClick={() => handleDelete(s._id)} className="btn btn-outline btn-sm btn-error flex-1 gap-1"><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{editing ? "Edit Income Source" : "Add Income Source"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Freelancing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">{editing ? "Update" : "Add"} Source</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceOverview;
