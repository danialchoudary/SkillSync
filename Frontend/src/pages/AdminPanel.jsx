import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { Shield, LogOut, ChevronRight, Users, Briefcase, Settings } from 'lucide-react';

export default function AdminPanel() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Topbar user={user} />
      <main className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-6 py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-bg)] flex items-center justify-center text-[var(--color-accent)] shadow-sm">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Admin Control Center</h1>
              <p className="text-[var(--color-text-secondary)] font-medium mt-1">Welcome back, {user?.name || 'Administrator'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Quick Stats Placeholder */}
            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-[var(--color-accent-bg)] text-[var(--color-accent)]">
                  <Users size={20} />
                </div>
                <span className="text-[10px] font-bold text-[var(--color-success)] uppercase bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full">+12% growth</span>
              </div>
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">1,284</h3>
            </div>

            <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                  <Briefcase size={20} />
                </div>
                <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase bg-[var(--color-accent-bg)] px-2 py-0.5 rounded-full">48 new today</span>
              </div>
              <p className="text-[11px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">Active Jobs</p>
              <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mt-1">342</h3>
            </div>
          </div>

          {/* Actions List */}
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-tight">Administrative Actions</h2>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-surface-secondary)] transition-colors group">
                <div className="flex items-center gap-4">
                  <Users size={18} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">User Management</span>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
              </button>
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-surface-secondary)] transition-colors group">
                <div className="flex items-center gap-4">
                  <Settings size={18} className="text-[var(--color-text-tertiary)]" />
                  <span className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">System Configuration</span>
                </div>
                <ChevronRight size={16} className="text-[var(--color-text-tertiary)]" />
              </button>
              <button
                onClick={() => dispatch(logout())}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-danger-bg)] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={18} className="text-[var(--color-danger)]" />
                  <span className="text-sm font-bold text-[var(--color-danger)]">Log Out</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
