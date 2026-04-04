"use client"

import { useEffect, useState } from "react"
import { X, AlertCircle } from "lucide-react"
import { Button } from "./ui/button"
import { z } from "zod"

const transactionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Transaction name is required").max(100, "Name must be under 100 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  categoryId: z.number().min(1, "Please select a category"),
  transactionTypeId: z.number().min(1, "Please select a transaction type"),
  transactionDate: z.date({ required_error: "Date is required" }),
  description: z.string().max(500, "Description must be under 500 characters").optional(),
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

type FormErrors = Partial<Record<keyof TransactionFormData, string>>

const formatDateForInput = (date: Date | string): string => {
  try {
    let dateObj: Date
    if (date instanceof Date) {
      dateObj = date
    } else {
      const cleanedDateStr = String(date).replace(/(\.\d{3})\d*/, '$1')
      dateObj = new Date(cleanedDateStr)
    }
    if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0]
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

const parseDate = (dateValue: Date | string): Date => {
  try {
    if (dateValue instanceof Date) return isNaN(dateValue.getTime()) ? new Date() : dateValue
    const cleanedDateStr = String(dateValue).replace(/(\.\d{3})\d*/, '$1')
    const parsed = new Date(cleanedDateStr)
    return isNaN(parsed.getTime()) ? new Date() : parsed
  } catch {
    return new Date()
  }
}

// Reusable error message component
const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
      <AlertCircle size={12} />
      {message}
    </p>
  ) : null

// Shared input classes
const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
    hasError
      ? "border-red-400 dark:border-red-500 focus:ring-red-400"
      : "border-gray-300 dark:border-gray-600"
  }`

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
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof TransactionFormData, boolean>>>({})

  useEffect(() => {
    if (!isOpen) return
    if (mode === "edit" && initialData) {
      setFormData({ ...initialData, transactionDate: parseDate(initialData.transactionDate) })
    } else {
      setFormData({ ...emptyForm, transactionDate: new Date() })
    }
    setErrors({})
    setTouched({})
  }, [isOpen, mode, initialData])

  if (!isOpen) return null

  // Validate a single field on blur
  const validateField = (field: keyof TransactionFormData, value: unknown) => {
    const partial = { ...formData, [field]: value }
    const result = transactionSchema.safeParse(partial)
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[field]
      setErrors(prev => ({ ...prev, [field]: fieldError?.[0] }))
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleBlur = (field: keyof TransactionFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  // Validate all fields and return whether the form is valid
  const validateAll = (): boolean => {
    const result = transactionSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const newErrors: FormErrors = {}
      for (const key of Object.keys(fieldErrors) as (keyof TransactionFormData)[]) {
        newErrors[key] = fieldErrors[key]?.[0]
      }
      setErrors(newErrors)
      // Mark all fields as touched so errors show
      setTouched({
        name: true, amount: true, categoryId: true,
        transactionTypeId: true, transactionDate: true, description: true,
      })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validateAll()) return
    onSubmit(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900">
          <div>
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-400">
              {mode === "edit" ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <p className="text-sm text-blue-500 dark:text-blue-400">
              {mode === "edit" ? "Update your transaction details" : "Record a new transaction"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full p-1 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Form body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          <input type="hidden" value={formData.id} />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Name <span className="text-red-500">*</span>
            </label>
            <input
              className={inputClass(!!touched.name && !!errors.name)}
              placeholder="Enter transaction name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => handleBlur("name")}
            />
            <FieldError message={touched.name ? errors.name : undefined} />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass(!!touched.amount && !!errors.amount)}
              placeholder="0.00"
              value={formData.amount || ""}
              onChange={e => setFormData({ ...formData, amount: +e.target.value })}
              onBlur={() => handleBlur("amount")}
            />
            <FieldError message={touched.amount ? errors.amount : undefined} />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={inputClass(!!touched.categoryId && !!errors.categoryId)}
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: +e.target.value })}
                onBlur={() => handleBlur("categoryId")}
              >
                <option value={0}>Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <FieldError message={touched.categoryId ? errors.categoryId : undefined} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                className={inputClass(!!touched.transactionTypeId && !!errors.transactionTypeId)}
                value={formData.transactionTypeId}
                onChange={e => setFormData({ ...formData, transactionTypeId: +e.target.value })}
                onBlur={() => handleBlur("transactionTypeId")}
              >
                <option value={0}>Select type</option>
                {transactionTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <FieldError message={touched.transactionTypeId ? errors.transactionTypeId : undefined} />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transaction Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              className={inputClass(!!touched.transactionDate && !!errors.transactionDate)}
              value={formatDateForInput(formData.transactionDate)}
              onChange={e => setFormData({ ...formData, transactionDate: new Date(e.target.value) })}
              onBlur={() => handleBlur("transactionDate")}
            />
            <FieldError message={touched.transactionDate ? errors.transactionDate : undefined} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
              <span className="ml-1 text-xs text-gray-400 dark:text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              className={inputClass(!!touched.description && !!errors.description) + " resize-none"}
              placeholder="Add any additional notes..."
              rows={3}
              value={formData.description || ""}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => handleBlur("description")}
            />
            <div className="flex justify-between items-start mt-1">
              <FieldError message={touched.description ? errors.description : undefined} />
              <span className={`text-xs ml-auto ${
                (formData.description?.length ?? 0) > 450
                  ? "text-red-500"
                  : "text-gray-400 dark:text-gray-500"
              }`}>
                {formData.description?.length ?? 0}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
          >
            {mode === "edit" ? "Update Transaction" : "Create Transaction"}
          </Button>
        </div>
      </div>
    </div>
  )
}