import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Edit2, Save, X, Loader2 } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { accountsService, type AccountDTO } from '../services/accountsService';
import ThemeToggle from '../components/Theme/ThemeToggle';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [accounts, setUserAccounts] = useState<AccountDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const [profile, setProfile] = useState({ name: '', username: '', email: '' });
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const headerRef = useRef<HTMLDivElement>(null);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const reportsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadUser();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (!user?.userId) return;
    try {
      const response = await accountsService.getAllAccounts(user.userId);
      setUserAccounts(response);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const loadUser = async () => {
    if (!user?.userId) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoaded(false);
      setError(null);
      const data = await userService.getUserDetails(user.userId);
      const userProfile = {
        name: data.fullName || 'N/A',
        username: data.username || 'N/A',
        email: data.email || 'N/A',
      };
      setProfile(userProfile);
      setEditedProfile(userProfile);
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => setLoaded(true), 10);
      }, 10);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError('Failed to load user details. Please try again.');
      setLoading(false);
      setTimeout(() => setLoaded(true), 100);
    }
  };

  const handleEdit = () => { setIsEditing(true); setEditedProfile({ ...profile }); };

  const handleSave = async () => {
    try {
      await userService.updateUserDetails({
        id: user!.userId,
        userName: editedProfile.username,
        fullName: editedProfile.name,
        email: editedProfile.email,
      });
      setProfile({ ...editedProfile });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  const handleCancel = () => { setEditedProfile({ ...profile }); setIsEditing(false); };
  const handleChange = (field: string, value: string) => setEditedProfile({ ...editedProfile, [field]: value });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-lg p-8 shadow-lg">
            <div className="text-center text-red-600 dark:text-red-400">
              <p className="text-lg font-semibold mb-4">{error}</p>
              <button
                onClick={loadUser}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105 shadow-md"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const headerParallax = scrollY * 0.5;
  const profileParallax = scrollY * 0.3;
  const reportsParallax = scrollY * 0.15;

  return (
    <div className="relative overflow-hidden min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Decorative backgrounds */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />
      <div
        className={`fixed inset-0 bg-gradient-to-tr from-transparent via-blue-100/20 dark:via-blue-900/10 to-transparent pointer-events-none transition-opacity duration-1000 delay-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: `translateY(${scrollY * -0.3}px)` }}
      />

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div
          ref={headerRef}
          className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 p-6 rounded-lg shadow-lg transition-all duration-700 ${loaded ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`}
          style={{ transform: `translateY(${loaded ? -headerParallax * 0.1 : -48}px)` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">Profile</h1>
              <p className="text-blue-600 dark:text-blue-500 mt-1">Manage your account information and settings</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Profile Card */}
        <div
          ref={profileCardRef}
          className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-700 delay-100 hover:shadow-2xl ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          style={{ transform: `translateY(${loaded ? -profileParallax * 0.15 : 48}px)` }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
              <User className="w-12 h-12 text-white" />
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center border-b-2 border-blue-400 focus:border-blue-600 outline-none px-2 py-1 bg-transparent transition-all duration-300"
              />
            ) : (
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{profile.name}</h2>
            )}
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Username */}
            <div className={`transition-all duration-500 delay-200 ${loaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Username</label>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg shadow-sm">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-sm"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{profile.username}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={`transition-all duration-500 delay-300 ${loaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">Email Address</label>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 shadow-sm"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{profile.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className={`mt-8 flex gap-3 justify-center transition-all duration-500 delay-400 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-400 dark:bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 dark:hover:bg-gray-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Reports placeholder */}
        <div
          ref={reportsRef}
          className={`transition-all duration-700 delay-600 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
          style={{ transform: `translateY(${loaded ? -reportsParallax * 0.25 : 48}px)` }}
        />

        {/* Footer */}
        <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-lg transition-all duration-700 delay-700 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          <div className="flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Terms of Service</a>
            <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300">Contact</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">About</a>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-600 text-center">2024 FlixFlow. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}