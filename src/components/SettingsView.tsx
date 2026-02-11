import { useState } from 'react';
import { useApp } from '../store';
import {
  Settings,
  User,
  Bell,
  Monitor,
  Shield,
  Globe,
  Camera,
  Save,
  LogOut,
  Moon,
  Sun,
  KeyRound,
  CreditCard,
  Info,
} from 'lucide-react';
import { cn } from '../utils/cn';
import type { LanguageCode, ThemeMode } from '../types';
import { getLanguageName } from '../i18n';

type SettingsTab = 'profile' | 'notifications' | 'display' | 'privacy' | 'account' | 'about';

export function SettingsView() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('display');
  const [profileName, setProfileName] = useState(state.currentUser?.name ?? '');
  const [profileEmail, setProfileEmail] = useState(state.currentUser?.email ?? '');
  const [profileRole, setProfileRole] = useState(state.currentUser?.role ?? '');
  const [saved, setSaved] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'display', label: 'Appearance', icon: <Monitor size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield size={18} /> },
    { id: 'account', label: 'Account', icon: <KeyRound size={18} /> },
    { id: 'about', label: 'About', icon: <Info size={18} /> },
  ];

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveProfile = () => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: { name: profileName, email: profileEmail, role: profileRole }
    });
    showSaved();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 dark:bg-white">
            <Settings size={22} className="text-white dark:text-gray-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
          </div>
          {saved && (
            <div className="ml-auto flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400">
              <Save size={14} />
              Saved!
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => dispatch({ type: 'LOGOUT' })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <SettingsCard title="Profile Settings" description="Manage your personal information">
                {/* Avatar */}
                <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                  <div className="relative">
                    <div
                      className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
                      style={{ backgroundColor: state.currentUser?.color ?? '#8B5CF6' }}
                    >
                      {state.currentUser?.avatar ?? 'U'}
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 dark:bg-white border-2 border-white dark:border-gray-900 text-gray-400 hover:text-white dark:hover:text-gray-900 shadow-sm transition-colors">
                      <Camera size={12} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{state.currentUser?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{state.currentUser?.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Joined {state.currentUser?.joinedDate && new Date(state.currentUser.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <InputField label="Full Name" value={profileName} onChange={setProfileName} />
                  <InputField label="Email Address" value={profileEmail} onChange={setProfileEmail} type="email" />
                  <InputField label="Role / Title" value={profileRole} onChange={setProfileRole} />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                    <textarea
                      rows={3}
                      placeholder="Tell us a bit about yourself..."
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === 'display' && (
              <SettingsCard title="Appearance" description="Customize how Projectify looks and feels">
                {/* Theme Selection */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Theme</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: 'light' as ThemeMode, label: 'Light', icon: <Sun size={20} />, preview: 'bg-white border-gray-200' },
                      { id: 'dark' as ThemeMode, label: 'Dark', icon: <Moon size={20} />, preview: 'bg-gray-900 border-gray-700' },
                      { id: 'auto' as ThemeMode, label: 'System', icon: <Monitor size={20} />, preview: 'bg-gradient-to-br from-white to-gray-900' },
                    ]).map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: theme.id } })}
                        className={cn(
                          'relative overflow-hidden rounded-xl border-2 p-4 transition-all',
                          state.settings.theme === theme.id
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                      >
                        {/* Preview */}
                        <div className={cn('h-16 rounded-lg mb-3 border flex items-center justify-center', theme.preview)}>
                          {theme.id === 'light' && <Sun size={20} className="text-amber-500" />}
                          {theme.id === 'dark' && <Moon size={20} className="text-violet-400" />}
                          {theme.id === 'auto' && <Monitor size={20} className="text-gray-600 dark:text-gray-300" />}
                        </div>
                        
                        <div className="flex items-center justify-center gap-2">
                          <span className={state.settings.theme === theme.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'}>
                            {theme.icon}
                          </span>
                          <span className={cn(
                            'text-sm font-medium',
                            state.settings.theme === theme.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-gray-300'
                          )}>
                            {theme.label}
                          </span>
                        </div>
                        {state.settings.theme === theme.id && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-violet-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div className="mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Language</h3>
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-400" />
                    <select
                      value={state.settings.language}
                      onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { language: e.target.value as LanguageCode } })}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    >
                      {(['en', 'es', 'fr', 'de', 'pt', 'ja', 'zh'] as LanguageCode[]).map((code) => (
                        <option key={code} value={code}>{getLanguageName(code)}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Current language: {getLanguageName(state.settings.language)}
                  </p>
                </div>

                {/* Display Options */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Display Options</h3>
                  <div className="space-y-3">
                    <ToggleRow
                      label="Compact Mode"
                      description="Reduce spacing for a denser layout"
                      checked={state.settings.display.compactMode}
                      onChange={(v) => dispatch({ type: 'UPDATE_DISPLAY_SETTINGS', payload: { compactMode: v } })}
                    />
                    <ToggleRow
                      label="Show Avatars"
                      description="Display team member avatars in task cards"
                      checked={state.settings.display.showAvatars}
                      onChange={(v) => dispatch({ type: 'UPDATE_DISPLAY_SETTINGS', payload: { showAvatars: v } })}
                    />
                    <ToggleRow
                      label="Show Subtask Progress"
                      description="Display progress bars for subtasks"
                      checked={state.settings.display.showSubtaskProgress}
                      onChange={(v) => dispatch({ type: 'UPDATE_DISPLAY_SETTINGS', payload: { showSubtaskProgress: v } })}
                    />
                    <ToggleRow
                      label="Color Blind Mode"
                      description="Use patterns in addition to colors"
                      checked={state.settings.display.colorBlindMode}
                      onChange={(v) => dispatch({ type: 'UPDATE_DISPLAY_SETTINGS', payload: { colorBlindMode: v } })}
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === 'notifications' && (
              <SettingsCard title="Notifications" description="Choose what notifications you receive">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Channels</h3>
                    <div className="space-y-3">
                      <ToggleRow
                        label="Email Notifications"
                        description="Receive notifications via email"
                        checked={state.settings.notifications.email}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { email: v } })}
                      />
                      <ToggleRow
                        label="Push Notifications"
                        description="Receive push notifications on your device"
                        checked={state.settings.notifications.push}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { push: v } })}
                      />
                      <ToggleRow
                        label="Desktop Notifications"
                        description="Show browser notifications"
                        checked={state.settings.notifications.desktop}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { desktop: v } })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Activity</h3>
                    <div className="space-y-3">
                      <ToggleRow
                        label="Task Assigned"
                        description="When a task is assigned to you"
                        checked={state.settings.notifications.taskAssigned}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { taskAssigned: v } })}
                      />
                      <ToggleRow
                        label="Task Completed"
                        description="When a team member completes a task"
                        checked={state.settings.notifications.taskCompleted}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { taskCompleted: v } })}
                      />
                      <ToggleRow
                        label="Mentions"
                        description="When someone mentions you in a comment"
                        checked={state.settings.notifications.mentions}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { mentions: v } })}
                      />
                      <ToggleRow
                        label="Due Soon"
                        description="When a task is approaching its due date"
                        checked={state.settings.notifications.dueSoon}
                        onChange={(v) => dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload: { dueSoon: v } })}
                      />
                    </div>
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === 'privacy' && (
              <SettingsCard title="Privacy" description="Control your privacy and visibility">
                <div className="space-y-6">
                  <ToggleRow
                    label="Show Online Status"
                    description="Let others see when you're active"
                    checked={state.settings.privacy.showOnlineStatus}
                    onChange={(v) => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { showOnlineStatus: v } })}
                  />

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile Visibility</h3>
                    <div className="space-y-2">
                      {[
                        { id: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                        { id: 'team', label: 'Team Only', desc: 'Only team members can view' },
                        { id: 'private', label: 'Private', desc: 'Only you can view your profile' },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all',
                            state.settings.privacy.profileVisibility === opt.id
                              ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <input
                            type="radio"
                            name="profileVisibility"
                            value={opt.id}
                            checked={state.settings.privacy.profileVisibility === opt.id}
                            onChange={() => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { profileVisibility: opt.id as 'public' | 'team' | 'private' } })}
                            className="text-violet-600 focus:ring-violet-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                    <ToggleRow
                      label="Activity Visibility"
                      description="Show your recent activity to team members"
                      checked={state.settings.privacy.activityVisibility}
                      onChange={(v) => dispatch({ type: 'UPDATE_PRIVACY_SETTINGS', payload: { activityVisibility: v } })}
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === 'account' && (
              <SettingsCard title="Account" description="Manage your account and security">
                <div className="space-y-6">
                  {/* Password */}
                  <div className="pb-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <KeyRound size={16} className="text-gray-400" />
                      Change Password
                    </h3>
                    <div className="space-y-4 max-w-sm">
                      <InputField label="Current Password" value="" onChange={() => {}} type="password" placeholder="Enter current password" />
                      <InputField label="New Password" value="" onChange={() => {}} type="password" placeholder="Enter new password" />
                      <InputField label="Confirm Password" value="" onChange={() => {}} type="password" placeholder="Confirm new password" />
                      <button className="rounded-xl bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  {/* Subscription */}
                  <div className="pb-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      Subscription
                    </h3>
                    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-green-800 dark:text-green-400">Pro Plan</span>
                            <span className="rounded-full bg-green-200 dark:bg-green-800 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400">ACTIVE</span>
                          </div>
                          <p className="text-xs text-green-600 dark:text-green-500">Unlimited projects, team members, and storage</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-800 dark:text-green-400">$12<span className="text-xs font-normal text-green-600 dark:text-green-500">/mo</span></p>
                          <button className="text-xs text-green-700 dark:text-green-500 underline hover:no-underline">Manage</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                    <div className="rounded-xl border-2 border-dashed border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">Delete Account</p>
                          <p className="text-xs text-red-500 dark:text-red-400">This action is irreversible</p>
                        </div>
                        <button className="rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsCard>
            )}

            {activeTab === 'about' && (
              <SettingsCard title="About" description="Application information">
                <div className="space-y-6">
                  <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl font-bold text-white shadow-lg">
                      P
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Projectify</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Project Management Platform</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Version 2.0.0</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['Kanban Board', 'List View', 'Calendar View', 'Timeline (Gantt)', 'Workflow Diagram', 'Goals & OKRs', 'Reporting Dashboard', 'Team Inbox', 'Task Management', 'Real-time Search'].map((feature) => (
                        <div key={feature} className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      © 2025 Projectify. Built with React + TypeScript + Tailwind CSS
                    </p>
                  </div>
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 dark:border-gray-700 px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
      />
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors flex-shrink-0',
          checked ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5 left-0' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
