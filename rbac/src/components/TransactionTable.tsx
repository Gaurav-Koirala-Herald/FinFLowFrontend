"use client"

import { Edit2, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Transaction {
  id: number
  title: string
  type: string
  amount: number
  date: string
}

interface TransactionTableProps {
  data: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: number) => void
}

export default function TransactionTable({ data, onEdit, onDelete }: TransactionTableProps) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card rounded-lg shadow-md p-4">
      {/* Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full md:w-1/3 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-muted-foreground">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            )}
            {filteredData.map((transaction, idx) => (
              <tr
                key={transaction.id}
                className={`transition-colors hover:bg-primary/10 ${
                  idx % 2 === 0 ? "bg-card" : "bg-card/95"
                }`}
              >
                <td className="px-4 py-3 text-sm">{transaction.title}</td>
                <td className="px-4 py-3 text-sm">{transaction.type}</td>
                <td className="px-4 py-3 text-sm text-right">{transaction.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{transaction.date}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1 text-blue-500 hover:text-blue-600 rounded-md transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1 text-destructive hover:text-destructive/80 rounded-md transition-colors"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
