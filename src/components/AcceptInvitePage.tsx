import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, ArrowRight, LogIn, Sparkles, ArrowLeft, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import { buildApiUrl } from '../lib/api';

interface InviteData {
  projectName: string;
  inviterName: string;
  email: string;
  projectColor?: string;
  projectId?: string;
}

const INVITE_TOKEN_KEY = 'pendingInviteToken';
const ONBOARDED_PROJECT_KEY = 'onboardedProjects';

export function AcceptInvitePage() {
  const [status, setStatus] = useState<'loading' | 'error' | 'valid' | 'accepting' | 'success'>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem(INVITE_TOKEN_KEY, token);
      validateInvite(token);
    } else {
      setStatus('error');
      setErrorMessage('Token de invitación no proporcionado');
    }
  }, []);

  const validateInvite = async (token: string) => {
    try {
      const res = await fetch(buildApiUrl(`/api/invitations/verify/${token}`));
      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Invitación inválida o expirada');
        return;
      }

      // Check if already a member (from previous session)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        const memberCheck = await fetch(buildApiUrl(`/api/projects/${data.project?.id}/members`), {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (memberCheck.ok) {
          const memberData = await memberCheck.json();
          const currentUserId = getCurrentUserIdFromToken(authToken);
          const isMember = memberData.members?.some((m: any) => m.id === currentUserId);
          if (isMember) {
            setInviteData({
              projectName: data.project?.name || 'Unknown Project',
              inviterName: data.inviterName || 'Someone',
              email: data.email || '',
              projectColor: data.project?.color || '#8B5CF6',
              projectId: data.project?.id,
            });
            setStatus('success');
            return;
          }
        }
      }

      setInviteData({
        projectName: data.project?.name || 'Unknown Project',
        inviterName: data.inviterName || 'Someone',
        email: data.email || '',
        projectColor: data.project?.color || '#8B5CF6',
        projectId: data.project?.id,
      });
      setStatus('valid');
    } catch (err) {
      setStatus('error');
      setErrorMessage('Error al validar la invitación');
    }
  };

  const getCurrentUserIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.user?.id || null;
    } catch {
      return null;
    }
  };

  const redirectToLogin = () => {
    const token = new URLSearchParams(window.location.search).get('token') || 
                  localStorage.getItem(INVITE_TOKEN_KEY);
    
    if (token) {
      localStorage.setItem(INVITE_TOKEN_KEY, token);
    }
    
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/?login=true&returnTo=${returnUrl}`;
  };

  const acceptInvite = async () => {
    const token = new URLSearchParams(window.location.search).get('token') || 
                  localStorage.getItem(INVITE_TOKEN_KEY);
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Token de invitación no encontrado');
      return;
    }

    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
      redirectToLogin();
      return;
    }

    setStatus('accepting');

    try {
      const res = await fetch(buildApiUrl(`/api/invitations/${token}/accept`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('valid');
        toast.error(data.message || data.error || 'Error al aceptar invitación');
        return;
      }

      localStorage.removeItem(INVITE_TOKEN_KEY);
      
      // Save to onboarded projects
      const onboarded = JSON.parse(localStorage.getItem(ONBOARDED_PROJECT_KEY) || '[]');
      if (!onboarded.includes(data.projectId)) {
        onboarded.push(data.projectId);
        localStorage.setItem(ONBOARDED_PROJECT_KEY, JSON.stringify(onboarded));
      }

      // Update inviteData with projectId from response
      setInviteData(prev => prev ? { ...prev, projectId: data.projectId } : null);
      setStatus('success');
      
      toast.success(data.message || '¡Bienvenido al proyecto!');
    } catch (err) {
      setStatus('valid');
      toast.error('Error al aceptar invitación');
    }
  };

  const handleEnterProject = () => {
    if (inviteData?.projectId) {
      window.location.href = `/?project=${inviteData.projectId}`;
    } else {
      window.location.href = '/';
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  // ============ RENDER STATES ============

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 h-16 w-16 rounded-2xl bg-violet-500/20 animate-ping mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Validando invitación
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Por favor espera...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto backdrop-blur-sm">
                <XCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Invitación inválida
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                {errorMessage}
              </p>
              
              <button
                onClick={handleGoHome}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Home size={18} />
                Ir a FactoCero Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'accepting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/25">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Uniéndote al proyecto
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Procesando tu solicitud...
          </p>
        </div>
      </div>
    );
  }

  // SUCCESS STATE - Onboarding Screen
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            {/* Success Header */}
            <div 
              className="p-8 text-center relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${inviteData?.projectColor || '#8B5CF6'}15 0%, ${inviteData?.projectColor || '#8B5CF6'}05 100%)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-800/50" />
              <div className="relative">
                {/* Animated Check Circle */}
                <div className="relative inline-block mb-4">
                  <div 
                    className="h-20 w-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
                    style={{ 
                      background: `linear-gradient(135deg, ${inviteData?.projectColor || '#8B5CF6'} 0%, ${inviteData?.projectColor || '#8B5CF6'}dd 100%)`
                    }}
                  >
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ¡Te has unido!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Ya eres parte del proyecto
                </p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              {/* Project Info Card */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${inviteData?.projectColor || '#8B5CF6'} 0%, ${inviteData?.projectColor || '#8B5CF6'}dd 100%)`
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      Proyecto
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                      {inviteData?.projectName}
                    </p>
                  </div>
                </div>
                
                {inviteData?.inviterName && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Invitado por <span className="font-medium text-gray-700 dark:text-gray-300">{inviteData.inviterName}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* What's Next */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  ¿Qué puedes hacer ahora?
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">1</span>
                    </div>
                    <p>Ver y gestionar tareas del proyecto</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">2</span>
                    </div>
                    <p>Colaborar con otros miembros del equipo</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="h-5 w-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-violet-600 dark:text-violet-400 text-xs font-bold">3</span>
                    </div>
                    <p>Crear y asignar nuevas tareas</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={handleEnterProject}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              >
                Entrar al proyecto
                <ArrowRight size={18} />
              </button>

              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2 mt-3 px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VALID STATE - Accept Invitation Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700/50 overflow-hidden">
          {/* Header with gradient */}
          <div 
            className="p-8 text-center relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${inviteData?.projectColor || '#8B5CF6'}15 0%, ${inviteData?.projectColor || '#8B5CF6'}05 100%)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-800/50" />
            <div className="relative">
              <div 
                className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${inviteData?.projectColor || '#8B5CF6'} 0%, ${inviteData?.projectColor || '#8B5CF6'}dd 100%)`
                }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Has sido invitado
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                Confirma tu participación
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8">
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                  <LogIn className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{inviteData?.inviterName}</span> te ha invitado a:
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                    {inviteData?.projectName}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Invitación enviada a: <span className="font-medium">{inviteData?.email}</span>
                </p>
              </div>
            </div>

            <button
              onClick={acceptInvite}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              Aceptar invitación
              <ArrowRight size={18} />
            </button>

            <a
              href="/"
              className="block text-center mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              No gracias, ir al inicio
            </a>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          FactoCero Manager - Gestión de proyectos
        </p>
      </div>
    </div>
  );
}

export function hasPendingInvite(): string | null {
  return localStorage.getItem(INVITE_TOKEN_KEY);
}

export function clearPendingInvite(): void {
  localStorage.removeItem(INVITE_TOKEN_KEY);
}
