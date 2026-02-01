"use client";

import React, { useState } from "react";
import {
  PiggyBank,
  Building2,
  TrendingUp,
  CreditCard,
  Banknote,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  X,
  Save,
  Loader2
} from "lucide-react";

import {
  accountsService,
  type AccountDTO,
  type UpdateAccountDTO
} from "../services/accountsService";

interface AccountCardProps {
  data?: AccountDTO[];
  userId: number;
  onUpdate: () => void;
}

export default function AccountCard({
  data,
  userId,
  onUpdate
}: AccountCardProps) {
  const safeData: AccountDTO[] = Array.isArray(data) ? data : [];

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    accountName: "",
    accountTypeId: 1,
    accountBalance: 0,
    IsActive: true
  });

  const accountTypes = [
    { id: 1, name: "Savings", icon: PiggyBank },
    { id: 2, name: "Checking", icon: Building2 },
    { id: 3, name: "Investment", icon: TrendingUp },
    { id: 4, name: "Credit Card", icon: CreditCard },
    { id: 5, name: "Cash", icon: Banknote }
  ];

  const openAddModal = () => {
    setEditingAccount(null);
    setFormData({
      accountName: "",
      accountTypeId: 1,
      accountBalance: 0,
      IsActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (account: AccountDTO) => {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName,
      accountTypeId: account.accountTypeId,
      accountBalance: account.accountBalance,
      IsActive: account.IsActive
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.accountName.trim()) {
      alert("Account name is required");
      return;
    }

    if (formData.accountBalance < 0 && formData.accountTypeId !== 4) {
      alert("Negative balance allowed only for Credit Card accounts");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingAccount) {
        await accountsService.updateAccount({
          id: editingAccount.id,
          ...formData
        });
      } else {
        await accountsService.addAccount({
          userId,
          ...formData
        });
      }

      setShowModal(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to save account:", error);
      alert("Failed to save account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (account: AccountDTO) => {
    if (!confirm("Deactivate this account?")) return;

    try {
      setIsSubmitting(true);
      await accountsService.deleteAccount(
        userId,
        account.id
      );
      onUpdate();
    } catch {
      alert("Failed to deactivate account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (account: AccountDTO) => {
    try {
      setIsSubmitting(true);
      await accountsService.deleteAccount(
        userId,
        account.id
      );
      onUpdate();
    } catch {
      alert("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBalance = safeData
    .filter(a => a.IsActive)
    .reduce((sum, a) => sum + a.accountBalance, 0);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">My Accounts</h3>
          <p className="text-sm text-gray-500">
            Total Balance:{" "}
            <span className="font-semibold">
              Rs. {totalBalance.toFixed(2)}
            </span>
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Accounts */}
      {safeData.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <PiggyBank className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No accounts added yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeData.map(account => {
            const type = accountTypes.find(
              t => t.id === account.accountTypeId
            );
            if (!type) return null;

            const Icon = type.icon;

            return (
              <div
                key={account.id}
                className={`border rounded-xl p-5 shadow-sm transition ${!account.IsActive ? "opacity-60" : ""
                  }`}
              >
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        {account.accountName}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {type.name}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xl font-bold mb-4">
                  Rs. {account.accountBalance.toFixed(2)}
                </p>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openEditModal(account)}
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(account)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      {account.IsActive ? (
                        <Lock className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Unlock className="w-4 h-4 text-green-600" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeactivate(account)}
                      className="p-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">
                {editingAccount ? "Edit Account" : "Add Account"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Account Name"
                value={formData.accountName}
                onChange={e =>
                  setFormData({
                    ...formData,
                    accountName: e.target.value
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />

              <select
                value={formData.accountTypeId}
                onChange={e =>
                  setFormData({
                    ...formData,
                    accountTypeId: Number(e.target.value)
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                {accountTypes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Balance"
                value={formData.accountBalance}
                onChange={e =>
                  setFormData({
                    ...formData,
                    accountBalance: Number(e.target.value)
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              />

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
