"use client"

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {commonService, type TransactionCategoryDTO, type TransactionTypeDTO} from "../services/commonService";
import { Plus, Edit2, Trash2, Loader2, DollarSign, Calendar, FileText } from "lucide-react";
import { transactionService, type Transaction, type TransactionDto } from "../services/transactionService";


export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<TransactionTypeDTO[]>([]);
  const [transactionCategories, setTransactionCategories] = useState<TransactionCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<TransactionDto>({
    userId: user?.userId || 0,
    name: "",
    description: "",
    categoryId: 1, // Default Category
    transactionTypeId: 1, // Default Type
    amount: 0,
    transactionDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadTransactions();
    loadTransactionTypes();
    loadTransactionCategories();
  }, []);

  const loadTransactions = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const response = await transactionService.getAllTransactions(user.userId);
      setTransactions(response);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionTypes = async () => {
    try {
      const types = await commonService.getTransactionTypes();
      setTransactionTypes(types);
    } catch (error) {
      console.error("Failed to load transaction types:", error);
    }
  };

  const loadTransactionCategories = async () => {
    try {
      const categories = await commonService.getTransactionCategories();
      setTransactionCategories(categories);
    } catch (error) {
      console.error("Failed to load transaction categories:", error);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setFormData({
      userId: user?.userId || 0,
      name: "",
      description: "",
      categoryId: transactionCategories.length > 0 ? transactionCategories[0].id : 1,
      transactionTypeId: transactionTypes.length > 0 ? transactionTypes[0].id : 1,
      amount: 0,
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      id: transaction.id,
      userId: transaction.userId,
      name: transaction.name,
      description: transaction.description,
      categoryId: transaction.categoryId,
      transactionTypeId: transaction.transactionTypeId,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      await transactionService.deleteTransaction(id);
      loadTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const submissionData = {
      ...formData,
      userId: parseInt(formData.userId as unknown as string, 10), // Ensure userId is a number
    };

    if (editingTransaction) {
      // Update transaction
      await transactionService.updateTransaction(editingTransaction.id, submissionData);
    } else {
      // Add a new transaction
      await transactionService.createTransaction(submissionData);
    }

    setIsModalOpen(false);
    loadTransactions(); 
  } catch (error) {
    console.error("Failed to save transaction:", error);
  }
};

  const handleInputChange = (field: keyof TransactionDto, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your transactions</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(transaction)}
                  className="p-1 hover:bg-secondary rounded"
                >
                  <Edit2 size={16} className="text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="p-1 hover:bg-destructive/10 rounded"
                >
                  <Trash2 size={16} className="text-destructive" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1">
              {transaction.name}
            </h3>

            <p className="text-2xl font-bold text-primary mb-2">
              ${transaction.amount.toFixed(2)}
            </p>

            <p className="text-sm text-muted-foreground mb-3">{transaction.description}</p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar size={14} />
              {new Date(transaction.transactionDate).toLocaleDateString()}
            </div>

            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-md font-medium bg-secondary text-secondary-foreground">
                Category: {transactionCategories.find(category => category.id === transaction.categoryId)?.name || "Unknown"}
              </span>
              <span className="px-2 py-1 text-xs rounded-md font-medium bg-accent text-accent-foreground">
                Type: {transactionTypes.find(type => type.id === transaction.transactionTypeId)?.name || "Unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
          <p className="text-muted-foreground mb-4">Get started by creating your first transaction</p>
          <button
            onClick={handleCreate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Transaction
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form Fields */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Transaction name"
                  required
                />
              </div>

              {/* Transaction Type Dropdown */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Transaction Type
                </label>
                <select
                  value={formData.transactionTypeId}
                  onChange={(e) => handleInputChange("transactionTypeId", parseInt(e.target.value))}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {transactionTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange("categoryId", parseInt(e.target.value))}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {transactionCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Remaining Fields */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Transaction description"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => handleInputChange("transactionDate", e.target.value)}
                  className="w-full border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingTransaction ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}