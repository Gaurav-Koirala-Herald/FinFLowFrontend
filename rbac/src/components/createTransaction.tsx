"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "../components/ui/button"
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
    setFormData(mode === "edit" && initialData ? initialData : emptyForm)
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
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
          <button onClick={onClose} className="text-blue-400 hover:text-blue-600">
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <input type="hidden" value={formData.id}></input>
          <input
            className="w-full rounded-lg border border-primary px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Transaction name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="number"
            className="w-full rounded-lg border border-primary px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Amount"
            value={formData.amount || ""}
            onChange={e => setFormData({ ...formData, amount: +e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              className="rounded-lg border border-primary px-4 py-2 focus:ring-2 focus:ring-blue-500"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: +e.target.value })}
            >
              <option value={0}>Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              className="rounded-lg border border-primary px-4 py-2  focus:ring-2 focus:ring-blue-500"
              value={formData.transactionTypeId}
              onChange={e =>
                setFormData({ ...formData, transactionTypeId: +e.target.value })
              }
            >
              <option value={0}>Type</option>
              {transactionTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            className="w-full rounded-lg border border-primary px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.transactionDate instanceof Date ? formData.transactionDate.toISOString().split('T')[0] : ''}
            onChange={e => setFormData({ ...formData, transactionDate: new Date(e.target.value) })}
          />

          <textarea
            className="w-full rounded-lg border border-primary focus:ring-2 focus:ring-blue-500 px-4 py-2 outline-none"
            placeholder="Description (optional)"
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-200 bg-blue-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-blue-200 text-blue-600"
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
            {mode === "edit" ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}
