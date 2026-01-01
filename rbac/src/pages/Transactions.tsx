"use client"

import { useEffect, useState } from "react"
import TransactionTable from "../components/TransactionTable"
import { toast } from "sonner"
import { transactionService, type TransactionDto } from "../services/transactionService"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"
import { commonService, type TransactionCategoryDTO } from "../services/commonService"

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionDto[]>();
  const [categories,setCategories] = useState<TransactionCategoryDTO[]>([])
  const [transactionTypes,setTransactionTypes] = useState<TransactionCategoryDTO[]>([])
  const { user } = useAuth();

  const loadTransactions = async () => {
    try{
        const data = await transactionService.getAllTransactions(user?.userId || 0)
        setTransactions(data)
    }
    catch(err){
      toast.error("Failed to load transactions.")
    }

  }

  useEffect(() => {
    loadTransactions();
    loadCategories();
    loadTransactionTypes();
  }, []);


  const loadCategories = async ()=>{
    try{
        const data = await commonService.getTransactionCategories()
        setCategories(data);
    }
    catch(err){
      toast.error("Failed to load categories.")
    }
  }

  const loadTransactionTypes = async ()=>{
    try{
        const data = await commonService.getTransactionTypes();
        setTransactionTypes(data);
    }
    catch(err){
      toast.error("Failed to load transaction types.")
    }
  }
  const handleCreate = () =>{
    toast.info("Create transaction functionality to be implemented.")
  }
  const handleEdit = (transaction: TransactionDto) => {
    // Example: open modal or navigate to edit page
    toast.info(`Editing transaction: ${transaction.name}`)
  }

  const handleDelete = (id: number | undefined) => {
    setTransactions((prev) => prev?.filter((t) => t.id !== id) || [])
    toast.success("Transaction deleted successfully!")
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Manage your transactions</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={18} /> Add Transaction
        </Button>
      </div>
      <TransactionTable
        data={transactions || []}
        transactionCategories={categories}
        transactionTypes={transactionTypes}
        onCreate ={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
