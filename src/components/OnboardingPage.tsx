import { useState } from 'react';
import { Loader2, Sparkles, ArrowRight, FolderPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../store';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function OnboardingPage() {
  const { dispatch } = useApp();
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);

    console.log('[Onboarding] Creating project with:', {
      name: projectName.trim(),
      owner_id: user.id,
      owner_id_type: typeof user.id,
      is_valid_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
    });

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectName.trim(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('[Onboarding] Supabase error:', error);
        throw new Error(error.message || 'Failed to create project');
      }

      console.log('[Onboarding] Project created:', data);

      toast.success('Project created!');
      
      dispatch({ 
        type: 'ADD_PROJECT', 
        payload: {
          id: data.id,
          name: data.name,
          description: data.description || '',
          color: '#8B5CF6',
          icon: '📁',
          isFavorite: false,
          memberIds: [],
        }
      });
      
      dispatch({ 
        type: 'SET_VIEW', 
        payload: { view: 'project', projectId: data.id } 
      });

      setTimeout(() => {
        window.location.href = `/?project=${data.id}`;
      }, 500);
    } catch (err) {
      console.error('[Onboarding] Catch error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Welcome to FactoCero Manager
            </h1>
            <p className="text-violet-100 mt-1">
              Let's create your first project
            </p>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What's your project called?
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !projectName.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating project...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-5 w-5" />
                    Create Project
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                You'll be able to add tasks, invite team members, and track progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
