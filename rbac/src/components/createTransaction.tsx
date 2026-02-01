"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "./ui/button"
import { z } from "zod"

const transactionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  amount: z.number().positive(),
  categoryId: z.number().positive(),
  transactionTypeId: z.number().positive(),
  transactionDate: z.date(),
  description: z.string().optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>

interface Props {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: TransactionFormData
  onClose: () => void
  onSubmit: (data: TransactionFormData) => void
  categories: { id: number; name: string }[]
  transactionTypes: { id: number; name: string }[]
}

const emptyForm: TransactionFormData = {
  id: 0,
  name: "",
  amount: 0,
  categoryId: 0,
  transactionTypeId: 0,
  transactionDate: new Date(),
  description: "",
}

// Helper function to convert date to YYYY-MM-DD format
const formatDateForInput = (date: Date | string): string => {
  try {
    let dateObj: Date;
    
    if (date instanceof Date) {
      dateObj = date;
    } else {
      // Handle C# DateTime format with extra precision: "2025-12-17T07:06:42.7733333"
      // Truncate to 3 decimal places for fractional seconds
      const cleanedDateStr = String(date).replace(/(\.\d{3})\d*/, '$1');
      dateObj = new Date(cleanedDateStr);
    }
    
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Format as YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// Helper function to parse date from string
const parseDate = (dateValue: Date | string): Date => {
  try {
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? new Date() : dateValue;
    }
    
    // Handle C# DateTime format with extra precision: "2025-12-17T07:06:42.7733333"
    // Truncate to 3 decimal places for fractional seconds
    const cleanedDateStr = String(dateValue).replace(/(\.\d{3})\d*/, '$1');
    const parsed = new Date(cleanedDateStr);
    
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch {
    return new Date();
  }
}

export default function TransactionModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  categories,
  transactionTypes,
}: Props) {
  const [formData, setFormData] = useState<TransactionFormData>(emptyForm)

  useEffect(() => {
    if (!isOpen) return
    
    if (mode === "edit" && initialData) {
      setFormData({
        ...initialData,
        transactionDate: parseDate(initialData.transactionDate)
      })
    } else {
      setFormData({
        ...emptyForm,
        transactionDate: new Date()
      })
    }
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-100 max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-blue-700">
              {mode === "edit" ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <p className="text-sm text-blue-500">
              {mode === "edit"
                ? "Update your transaction details"
                : "Record a new transaction"}
            </p>
          </div>
          <button onClick={onClose} className="text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full p-1 transition-colors">
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input type="hidden" value={formData.id}></input>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Name
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter transaction name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={e => setFormData({ ...formData, amount: +e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: +e.target.value })}
              >
                <option value={0}>Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.transactionTypeId}
                onChange={e =>
                  setFormData({ ...formData, transactionTypeId: +e.target.value })
                }
              >
                <option value={0}>Select type</option>
                {transactionTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formatDateForInput(formData.transactionDate)}
              onChange={e => setFormData({ ...formData, transactionDate: new Date(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 py-2 outline-none transition-all resize-none"
              placeholder="Add any additional notes..."
              rows={3}
              value={formData.description || ""}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(formData)
              onClose()
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {mode === "edit" ? "Update Transaction" : "Create Transaction"}
          </Button>
        </div>
      </div>
    </div>
  )
} 