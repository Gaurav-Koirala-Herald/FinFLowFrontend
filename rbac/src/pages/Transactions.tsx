"use client"

import { useEffect, useState } from "react"
import TransactionTable from "../components/TransactionTable"
import { toast } from "sonner"
import { transactionService, type TransactionDto } from "../services/transactionService"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"
import { commonService, type TransactionCategoryDTO } from "../services/commonService"
import TransactionModal from "../components/CreateTransaction"

export default function Transactions() {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState<TransactionDto[]>([])
  const [categories, setCategories] = useState<TransactionCategoryDTO[]>([])
  const [transactionTypes, setTransactionTypes] = useState<TransactionCategoryDTO[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDto | null>(null)

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (!user?.userId) return
    loadTransactions()
    loadCategories()
    loadTransactionTypes()
  }, [user?.userId])

  const loadTransactions = async () => {
    try {
      const data = await transactionService.getAllTransactions(user!.userId)
      console.log(data);
      setTransactions(data)
    } catch {
      toast.error("Failed to load transactions.")
    }
  }

  const loadCategories = async () => {
    try {
      const data = await commonService.getTransactionCategories()
      setCategories(data)
    } catch {
      toast.error("Failed to load categories.")
    }
  }

  const loadTransactionTypes = async () => {
    try {
      const data = await commonService.getTransactionTypes()
      setTransactionTypes(data)
    } catch {
      toast.error("Failed to load transaction types.")
    }
  }


  const handleCreate = () => {
    setMode("create")
    setSelectedTransaction(null)
    setIsModalOpen(true)
  }



  const handleEdit = (transaction: TransactionDto) => {
    setMode("edit")
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }



  const handleModalSubmit = async (formData: TransactionDto) => {
    try {
      if (mode === "create") {
        await transactionService.createTransaction({
          ...formData,
          userId: user!.userId,
        })
        toast.success("Transaction created successfully!")
      }

      if (mode === "edit" && selectedTransaction) {
        const response = await transactionService.updateTransaction(
          selectedTransaction.id!,
          formData
        )
        if (response) {
          toast.success("Transaction updated successfully!")
        }
        else {
          toast.error("Failed to update transaction.")
        }
      }

      setIsModalOpen(false)
      await loadTransactions()
    } catch {
      toast.error("Failed to save transaction.")
    }
  }

  const handleDelete = async (id: number | undefined) => {
    if (!id) return
    try {
      await transactionService.deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success("Transaction deleted successfully!")
    } catch {
      toast.error("Failed to delete transaction.")
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your transactions
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={18} /> Add Transaction
        </Button>
      </div>

      {/* Table */}
      <TransactionTable
        data={transactions}
        transactionCategories={categories}
        transactionTypes={transactionTypes}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal (Create + Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        mode={mode}
        initialData={
          mode === "edit" && selectedTransaction
            ? {
              id: selectedTransaction.id,
              name: selectedTransaction.name,
              amount: selectedTransaction.amount,
              categoryId: selectedTransaction.categoryId,
              transactionTypeId: selectedTransaction.transactionTypeId,
              date: selectedTransaction.transactionDate.split("T")[0],
              description: selectedTransaction.description,
            }
            : undefined
        }
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        categories={categories}
        transactionTypes={transactionTypes}
      />
    </div>
  )
}
