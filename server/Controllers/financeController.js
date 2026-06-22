const mongoose = require("mongoose");
const FinanceTransaction = require("../Models/financeTransactionModel");
const FinanceBudget = require("../Models/financeBudgetModel");
const FinanceSavingsGoal = require("../Models/financeSavingsGoalModel");
const FinanceRecurring = require("../Models/financeRecurringModel");
const FinanceIncomeSource = require("../Models/financeIncomeSourceModel");

// ─── Helper: Currency Formatting Labels ───
const CURRENCY_SYMBOLS = { BDT: "৳", INR: "₹", USD: "$" };

// ─── TRANSACTIONS ───

const createTransaction = async (req, res) => {
  try {
    const { type, amount, currency, category, source, note, date, paymentMethod, attachmentUrl, isRecurring, recurringId } = req.body;
    const userId = req.user._id;

    if (!type || !amount || !currency) {
      return res.status(400).json({ success: false, message: "type, amount, and currency are required" });
    }
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ success: false, message: "type must be income or expense" });
    }
    if (!["BDT", "INR", "USD"].includes(currency)) {
      return res.status(400).json({ success: false, message: "currency must be BDT, INR, or USD" });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be positive" });
    }

    const transaction = await FinanceTransaction.create({
      userId,
      type,
      amount: Number(amount),
      currency,
      category: category || "",
      source: source || "",
      note: note || "",
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "cash",
      attachmentUrl: attachmentUrl || "",
      isRecurring: isRecurring || false,
      recurringId: recurringId || null,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = { userId };

    if (req.query.type) filter.type = req.query.type;
    if (req.query.currency) filter.currency = req.query.currency;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      filter.$or = [{ note: searchRegex }, { category: searchRegex }, { source: searchRegex }];
    }
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) filter.date.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.date.$lte = new Date(req.query.endDate);
    }

    const sortField = req.query.sortBy || "date";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const [transactions, total] = await Promise.all([
      FinanceTransaction.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      FinanceTransaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const transaction = await FinanceTransaction.findOne({ _id: id, userId: req.user._id }).lean();
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const transaction = await FinanceTransaction.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const transaction = await FinanceTransaction.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!transaction) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD SUMMARY ───

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { type: "$type", currency: "$currency" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ];

    const results = await FinanceTransaction.aggregate(pipeline);

    const summary = {};
    const currencies = ["BDT", "INR", "USD"];

    for (const c of currencies) {
      summary[c] = { income: 0, expense: 0, balance: 0, incomeCount: 0, expenseCount: 0 };
    }

    for (const r of results) {
      const curr = r._id.currency;
      if (!summary[curr]) continue;
      if (r._id.type === "income") {
        summary[curr].income = r.total;
        summary[curr].incomeCount = r.count;
      } else {
        summary[curr].expense = r.total;
        summary[curr].expenseCount = r.count;
      }
    }

    for (const c of currencies) {
      summary[c].balance = summary[c].income - summary[c].expense;
    }

    // Overall totals across all currencies (display only, no conversion)
    const totalIncome = currencies.reduce((sum, c) => sum + summary[c].income, 0);
    const totalExpense = currencies.reduce((sum, c) => sum + summary[c].expense, 0);
    const totalBalance = totalIncome - totalExpense;

    res.status(200).json({
      success: true,
      data: {
        currencies: summary,
        totals: { income: totalIncome, expense: totalExpense, balance: totalBalance },
        month: m,
        year: y,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ANALYTICS ───

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currency, months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const matchFilter = { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate } };
    if (currency) matchFilter.currency = currency;

    // Monthly income vs expense
    const monthlyPipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
            currency: "$currency",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const monthlyData = await FinanceTransaction.aggregate(monthlyPipeline);

    // Spending by category (expenses only)
    const categoryFilter = { ...matchFilter, type: "expense" };
    const categoryPipeline = [
      { $match: categoryFilter },
      {
        $group: {
          _id: { category: "$category", currency: "$currency" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ];

    const categoryData = await FinanceTransaction.aggregate(categoryPipeline);

    // Income by source
    const sourceFilter = { ...matchFilter, type: "income" };
    const sourcePipeline = [
      { $match: sourceFilter },
      {
        $group: {
          _id: { source: "$source", currency: "$currency" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ];

    const sourceData = await FinanceTransaction.aggregate(sourcePipeline);

    // Per-currency totals
    const totalPipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { type: "$type", currency: "$currency" },
          total: { $sum: "$amount" },
        },
      },
    ];
    const totalData = await FinanceTransaction.aggregate(totalPipeline);

    res.status(200).json({
      success: true,
      data: {
        monthly: monthlyData,
        categories: categoryData,
        sources: sourceData,
        totals: totalData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BUDGETS ───

const createBudget = async (req, res) => {
  try {
    const { category, limit, currency, month, year } = req.body;
    const userId = req.user._id;

    if (!category || !limit || !currency || !month || !year) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await FinanceBudget.findOne({ userId, category, month, year, currency });
    if (existing) {
      return res.status(400).json({ success: false, message: "Budget already exists for this category/month/currency" });
    }

    const budget = await FinanceBudget.create({ userId, category, limit: Number(limit), currency, month: Number(month), year: Number(year) });
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year, currency } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const filter = { userId, month: m, year: y };
    if (currency) filter.currency = currency;

    const budgets = await FinanceBudget.find(filter).lean();

    // Get spent amounts for each budget
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const spentPipeline = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { category: "$category", currency: "$currency" },
          spent: { $sum: "$amount" },
        },
      },
    ];

    const spentData = await FinanceTransaction.aggregate(spentPipeline);
    const spentMap = {};
    for (const s of spentData) {
      const key = `${s._id.category}_${s._id.currency}`;
      spentMap[key] = s.spent;
    }

    const enriched = budgets.map((b) => {
      const key = `${b.category}_${b.currency}`;
      const spent = spentMap[key] || 0;
      return { ...b, spent, remaining: Math.max(0, b.limit - spent), percentage: b.limit > 0 ? Math.min(100, (spent / b.limit) * 100) : 0 };
    });

    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBudget = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const budget = await FinanceBudget.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const budget = await FinanceBudget.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });
    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── SAVINGS GOALS ───

const createSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, currency, targetDate, icon, color } = req.body;
    const userId = req.user._id;

    if (!name || !targetAmount || !currency || !targetDate) {
      return res.status(400).json({ success: false, message: "name, targetAmount, currency, and targetDate are required" });
    }

    const goal = await FinanceSavingsGoal.create({
      userId, name, targetAmount: Number(targetAmount), currency, targetDate: new Date(targetDate),
      icon: icon || "savings", color: color || "#0F6B4A",
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSavingsGoals = async (req, res) => {
  try {
    const goals = await FinanceSavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    const enriched = goals.map((g) => ({
      ...g,
      percentage: g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0,
      remaining: Math.max(0, g.targetAmount - g.currentAmount),
    }));
    res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSavingsGoal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const goal = await FinanceSavingsGoal.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: "Savings goal not found" });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSavingsGoal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const goal = await FinanceSavingsGoal.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Savings goal not found" });
    res.status(200).json({ success: true, message: "Savings goal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToSavingsGoal = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "amount must be positive" });
  }
  try {
    const goal = await FinanceSavingsGoal.findOne({ _id: id, userId: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: "Savings goal not found" });

    goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + Number(amount));
    if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RECURRING TRANSACTIONS ───

const createRecurring = async (req, res) => {
  try {
    const { type, amount, currency, category, source, note, paymentMethod, frequency, nextDueDate } = req.body;
    const userId = req.user._id;

    if (!type || !amount || !currency || !frequency || !nextDueDate) {
      return res.status(400).json({ success: false, message: "type, amount, currency, frequency, and nextDueDate are required" });
    }

    const recurring = await FinanceRecurring.create({
      userId, type, amount: Number(amount), currency, category: category || "",
      source: source || "", note: note || "", paymentMethod: paymentMethod || "cash",
      frequency, nextDueDate: new Date(nextDueDate),
    });

    res.status(201).json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRecurring = async (req, res) => {
  try {
    const recurring = await FinanceRecurring.find({ userId: req.user._id }).sort({ nextDueDate: 1 }).lean();
    res.status(200).json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateRecurring = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const recurring = await FinanceRecurring.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!recurring) return res.status(404).json({ success: false, message: "Recurring transaction not found" });
    res.status(200).json({ success: true, data: recurring });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteRecurring = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const recurring = await FinanceRecurring.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!recurring) return res.status(404).json({ success: false, message: "Recurring transaction not found" });
    res.status(200).json({ success: true, message: "Recurring transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const dueRecurring = await FinanceRecurring.find({
      userId,
      isActive: true,
      nextDueDate: { $lte: now },
    }).lean();

    const created = [];
    for (const rec of dueRecurring) {
      const transaction = await FinanceTransaction.create({
        userId,
        type: rec.type,
        amount: rec.amount,
        currency: rec.currency,
        category: rec.category,
        source: rec.source,
        note: rec.note,
        date: rec.nextDueDate,
        paymentMethod: rec.paymentMethod,
        isRecurring: true,
        recurringId: rec._id,
      });

      created.push(transaction);

      // Calculate next due date
      const next = new Date(rec.nextDueDate);
      switch (rec.frequency) {
        case "daily": next.setDate(next.getDate() + 1); break;
        case "weekly": next.setDate(next.getDate() + 7); break;
        case "monthly": next.setMonth(next.getMonth() + 1); break;
        case "yearly": next.setFullYear(next.getFullYear() + 1); break;
      }

      await FinanceRecurring.findByIdAndUpdate(rec._id, {
        nextDueDate: next,
        lastGeneratedDate: rec.nextDueDate,
      });
    }

    res.status(200).json({ success: true, data: created, generated: created.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REPORTS ───

const getReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year, currency } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const filter = { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } };
    if (currency) filter.currency = currency;

    // Summary by currency
    const summaryPipeline = [
      { $match: filter },
      {
        $group: {
          _id: { type: "$type", currency: "$currency" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ];
    const summary = await FinanceTransaction.aggregate(summaryPipeline);

    // Top spending categories
    const categoryPipeline = [
      { $match: { ...filter, type: "expense" } },
      { $group: { _id: { category: "$category", currency: "$currency" }, total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ];
    const topCategories = await FinanceTransaction.aggregate(categoryPipeline);

    // Top income sources
    const sourcePipeline = [
      { $match: { ...filter, type: "income" } },
      { $group: { _id: { source: "$source", currency: "$currency" }, total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ];
    const topSources = await FinanceTransaction.aggregate(sourcePipeline);

    // Daily breakdown
    const dailyPipeline = [
      { $match: filter },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$date" }, type: "$type", currency: "$currency" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.day": 1 } },
    ];
    const dailyBreakdown = await FinanceTransaction.aggregate(dailyPipeline);

    res.status(200).json({
      success: true,
      data: { summary, topCategories, topSources, dailyBreakdown, month: m, year: y, currency: currency || "ALL" },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── INCOME SOURCES ───

const createIncomeSource = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "name is required" });
    }

    const existing = await FinanceIncomeSource.findOne({ userId, name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Source already exists" });
    }

    const source = await FinanceIncomeSource.create({
      userId,
      name: name.trim(),
      description: description || "",
    });

    res.status(201).json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getIncomeSources = async (req, res) => {
  try {
    const sources = await FinanceIncomeSource.find({ userId: req.user._id })
      .sort({ name: 1 })
      .lean();
    res.status(200).json({ success: true, data: sources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateIncomeSource = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const source = await FinanceIncomeSource.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!source) return res.status(404).json({ success: false, message: "Source not found" });
    res.status(200).json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteIncomeSource = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }
  try {
    const source = await FinanceIncomeSource.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!source) return res.status(404).json({ success: false, message: "Source not found" });
    res.status(200).json({ success: true, message: "Source deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
