const express = require("express");
const { requireAuth, requireAdmin } = require("../Middleware/authMiddleware");

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
  getAnalytics,
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal,
  addToSavingsGoal,
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
  generateRecurringTransactions,
  getReport,
  createIncomeSource,
  getIncomeSources,
  updateIncomeSource,
  deleteIncomeSource,
} = require("../Controllers/financeController");

const router = express.Router();

// All finance routes require auth + admin
router.use(requireAuth, requireAdmin);

// ─── Transactions ───
router.post("/transactions", createTransaction);
router.get("/transactions", getTransactions);
router.get("/transactions/:id", getTransactionById);
router.patch("/transactions/:id", updateTransaction);
router.delete("/transactions/:id", deleteTransaction);

// ─── Dashboard ───
router.get("/dashboard", getDashboardSummary);

// ─── Analytics ───
router.get("/analytics", getAnalytics);

// ─── Budgets ───
router.post("/budgets", createBudget);
router.get("/budgets", getBudgets);
router.patch("/budgets/:id", updateBudget);
router.delete("/budgets/:id", deleteBudget);

// ─── Savings Goals ───
router.post("/savings", createSavingsGoal);
router.get("/savings", getSavingsGoals);
router.patch("/savings/:id", updateSavingsGoal);
router.delete("/savings/:id", deleteSavingsGoal);
router.post("/savings/:id/add", addToSavingsGoal);

// ─── Recurring Transactions ───
router.post("/recurring", createRecurring);
router.get("/recurring", getRecurring);
router.patch("/recurring/:id", updateRecurring);
router.delete("/recurring/:id", deleteRecurring);
router.post("/recurring/generate", generateRecurringTransactions);

// ─── Reports ───
router.get("/reports", getReport);

// ─── Income Sources ───
router.post("/income-sources", createIncomeSource);
router.get("/income-sources", getIncomeSources);
router.patch("/income-sources/:id", updateIncomeSource);
router.delete("/income-sources/:id", deleteIncomeSource);

module.exports = router;
