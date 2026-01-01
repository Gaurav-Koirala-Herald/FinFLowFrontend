"use client"

import { useState } from "react"
import TransactionTable from "../components/TransactionTable"
import { toast } from "sonner"

// Example transaction type
interface Transaction {
  id: number
  title: string
  type: string
  amount: number
  date: string
}

export default function Transactions() {
  // Dummy initial data
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, title: "Deposit", type: "Credit", amount: 5000, date: "2026-01-01" },
    { id: 2, title: "Withdrawal", type: "Debit", amount: 2000, date: "2026-01-02" },
    { id: 3, title: "Payment", type: "Debit", amount: 1500, date: "2026-01-03" },
  ])

  const handleEdit = (transaction: Transaction) => {
    // Example: open modal or navigate to edit page
    toast.info(`Editing transaction: ${transaction.title}`)
  }

  const handleDelete = (id: number) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success("Transaction deleted successfully!")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Transactions</h2>
      <TransactionTable
        data={transactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
