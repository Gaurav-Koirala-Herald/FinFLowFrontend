"use client"

import React, { useState, useEffect } from 'react';
import { User, Mail, Edit2, Save, X, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    email: '',
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    if (!user?.userId) {
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching user details for userId:", user.userId);
      const data = await userService.getUserDetails(user.userId);
      const userProfile = {
        name: data.fullName || 'N/A',
        username: data.username || 'N/A',
        email: data.email || 'N/A',
      };
      
      setProfile(userProfile);
      setEditedProfile(userProfile);
    } catch (err) {
      console.error("Failed to load user:", err);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    try {

        await userService.updateUserDetails({
            id: user!.userId,
            userName: editedProfile.username,
            fullName: editedProfile.name,
            email: editedProfile.email,
        })
      setProfile({ ...editedProfile });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save changes. Please try again.");
    }
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (field: string, value: string) => {
    setEditedProfile({ ...editedProfile, [field]: value });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8 flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account information</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center text-destructive">
            <p>{error}</p>
            <button
              onClick={loadUser}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-8">
        {/* Profile Avatar and Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="text-2xl font-semibold text-foreground text-center border-b-2 border-primary/30 focus:border-primary outline-none px-2 py-1 bg-transparent"
            />
          ) : (
            <h2 className="text-2xl font-semibold text-foreground">{profile.name}</h2>
          )}
          <p className="text-primary text-sm mt-1">Premium Member</p>
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Username</label>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="flex-1 border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <span className="text-foreground">{profile.username}</span>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email Address</label>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              {isEditing ? (
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="flex-1 border border-border bg-background rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <span className="text-foreground">{profile.email}</span>
              )}
            </div>
          </div>



          {/* Active Subscriptions */}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 justify-center">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
          <a href="#" className="hover:text-primary transition-colors">About</a>
        </div>
        <p className="text-xs text-muted-foreground text-center">2024 FlixFlow. All rights reserved.</p>
      </div>
    </div>
  )
}