import React, { useState } from 'react';
import { 
  PiggyBank, 
  Building2, 
  TrendingUpIcon, 
  CreditCard, 
  Banknote, 
  Edit, 
  Trash2, 
  X, 
  Plus, 
  MoreVertical, 
  TrendingUp, 
  TrendingDown,
  Lock,
  Unlock
} from 'lucide-react';
import { accountsService, type AccountDTO } from "../services/accountsService";

interface AccountCardProps {
  data?: AccountDTO[];
  userId: number;
  onUpdate: () => void;
}

interface AccountType {
  id: number;
  name: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

export default function AccountCard({ data = [], userId, onUpdate }: AccountCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDTO | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    accountTypeId: 1,
    accountBalance: 0,
    IsActive: true
  });

  // ✅ SAFETY: ensure data is always an array
  const safeData: AccountDTO[] = Array.isArray(data) ? data : [];

  const accountTypes: AccountType[] = [
    { id: 1, name: "Savings", IconComponent: PiggyBank },
    { id: 2, name: "Checking", IconComponent: Building2 },
    { id: 3, name: "Investment", IconComponent: TrendingUpIcon },
    { id: 4, name: "Credit Card", IconComponent: CreditCard },
    { id: 5, name: "Cash", IconComponent: Banknote }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccountType = (id: number) => {
    return accountTypes.find(t => t.id === id) || accountTypes[0];
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setFormData({
      accountName: '',
      accountTypeId: 1,
      accountBalance: 0,
      IsActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (account: AccountDTO) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountTypeId: account.accountTypeId,
      accountBalance: account.accountBalance,
      IsActive: account.IsActive
    });
    setShowModal(true);
    setShowDropdown(null);
  };

  const handleToggleStatus = async (account: AccountDTO) => {
    try {
      setIsSubmitting(true);
      onUpdate();
      setShowDropdown(null);
    } catch (error) {
      console.error('Failed to update account status:', error);
      alert('Failed to update account status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        setIsSubmitting(true);
        onUpdate();
        setShowDropdown(null);
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.accountName.trim()) {
      alert('Please enter an account name');
      return;
    }

    try {
      setIsSubmitting(true);
      await accountsService.addAccount({
        userId: userId,
        ...formData
      });
      onUpdate();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save account:', error);
      alert('Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalBalance = safeData
    .filter(a => a.IsActive)
    .reduce((sum, a) => sum + a.accountBalance, 0);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">My Accounts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total Balance: <span className="font-semibold text-primary">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {safeData.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No accounts yet</h3>
          <p className="text-muted-foreground mb-4">Create your first account to get started</p>
          <button
            onClick={handleAdd}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeData.map((account) => {
            const accountType = getAccountType(account.accountTypeId);
            const isPositive = account.accountBalance >= 0;

            return (
              <div
                key={account.id}
                className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                  !account.IsActive ? 'opacity-60' : ''
                }`}
              >
                {/* Card Header */}
                {/* --- DESIGN UNCHANGED --- */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
