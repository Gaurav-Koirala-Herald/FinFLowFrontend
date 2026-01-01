"use client"
import { Edit2, Trash } from "lucide-react"
import { useState, useEffect } from "react"

interface TransactionDto {
  id?: number
  name: string
  transactionTypeId: number
  categoryId: number
  amount: number
  transactionDate: string
}

interface TransactionTypeDTO {
  id: number
  name: string
}

interface TransactionTableProps {
  data: TransactionDto[]
  transactionTypes: TransactionTypeDTO[]
  transactionCategories: TransactionTypeDTO[]
  onCreate: (transaction: TransactionDto) => void
  onEdit: (transaction: TransactionDto) => void
  onDelete: (id: number | undefined) => void
}

export default function TransactionTable({
  data,
  transactionCategories,
  transactionTypes,
  onCreate,
  onEdit,
  onDelete
}: TransactionTableProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | "">("")
  const [selectedType, setSelectedType] = useState<number | "">("") 
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPageChanging, setIsPageChanging] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const filteredData = data.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === "" || t.categoryId === selectedCategory
    const matchesType = selectedType === "" || t.transactionTypeId === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setIsPageChanging(true)
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setIsPageChanging(false)
      }, 300)
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setIsPageChanging(true)
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setIsPageChanging(false)
      }, 300)
    }
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedCategory, selectedType])

  return (
    <div className="relative bg-card gap-4 rounded-lg shadow-md p-4">
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
      />

      <div
        className={`relative mb-4 flex items-center transition-all duration-700 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
          }`}
      >
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full md:w-1/3 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="ml-4 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Category</option>
          {
            transactionCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))
          }
        </select>
        <select
          className="ml-4 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Transaction Type</option>
          {
            transactionTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))
          }
        </select>
      </div>
      <div
        className={`relative overflow-x-auto transition-all duration-700 delay-200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
      >
        <table className="min-w-full divide-y divide-border">
          <thead
            className={`bg-secondary/50 transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
          >
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Category</th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-muted-foreground">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            )}
            {paginatedData.map((transaction, idx) => (
              <tr
                key={transaction.id}
                className={`transition-all duration-500 hover:bg-primary/10 ${idx % 2 === 0 ? "bg-card" : "bg-card/95"
                  } ${!isPageChanging ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                style={{
                  transitionDelay: !isPageChanging ? `${idx * 50}ms` : '0ms'
                }}
              >
                <td className="px-4 py-3 text-sm">{transaction.name}</td>
                <td className="px-4 py-3 text-sm">
                  {transactionTypes.find((type) => type.id === transaction.transactionTypeId)?.name}
                </td>
                <td className="px-4 py-3 text-sm">
                  {transactionCategories.find((cat) => cat.id === transaction.categoryId)?.name}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium">
                  {transaction.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="p-1 text-blue-500 hover:text-blue-600 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="p-1 text-destructive hover:text-destructive/80 rounded-md transition-all duration-200 hover:scale-110 active:scale-95"
                  >
                    <Trash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className={`relative flex justify-between items-center mt-4 pt-4 border-t border-border transition-all duration-700 delay-400 ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="text-sm text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium"
          >
            Previous
          </button>
          <p className="text-sm text-gray-500 flex items-center font-medium">
            Page {currentPage} of {totalPages} ({filteredData.length} transactions)
          </p>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="text-sm text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}