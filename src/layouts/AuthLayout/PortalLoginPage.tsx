import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button, Input, FormField, Checkbox } from '@ds/primitives';
import { useAuthStore } from '@/app/stores/auth';

interface PortalLoginPageProps {
  title: string;
  subtitle: string;
  redirectTo: string;
  poweredBy?: boolean;
  emailLabel?: string;
}

/** Shared centered login card for the Client & Employee portals (C2.1 / E2.1). */
export function PortalLoginPage({ title, subtitle, redirectTo, poweredBy, emailLabel = 'Email' }: PortalLoginPageProps) {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(redirectTo);
    } catch {
      setError('Email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">

        {/* Branded header */}
        <div
          className="relative flex flex-col items-center gap-4 overflow-hidden px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgb(185,28,28) 0%, rgb(220,38,38) 50%, rgb(153,27,27) 100%)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div
            className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <img src="/logo.png" alt="TechxServe" className="relative h-20 w-auto brightness-0 invert" />
          <div className="relative">
            <h1 className="font-display text-xl font-bold text-white">{title}</h1>
            <p className="mt-1 text-sm text-white/70">{subtitle}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-8">
          <FormField label={emailLabel}>
            <Input icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </FormField>
          <FormField label="Password">
            <Input type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </FormField>
          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          )}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-content-muted">
              <Checkbox defaultChecked /> Remember me
            </label>
            <button type="button" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </button>
          </div>
          <Button type="submit" fullWidth size="lg" loading={loading} iconRight={ArrowRight}>
            Sign In
          </Button>
        </form>
      </div>

      {poweredBy && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <a href="https://techxserve.com" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
            <img src="/logo.png" alt="TechxServe" className="h-[72px] w-auto" />
          </a>
          <p className="text-sm font-bold text-content">Built by TechxServe</p>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <a href="https://techxserve.com" target="_blank" rel="noopener noreferrer"
               className="text-brand-600 hover:underline">
              techxserve.com
            </a>
            <span className="text-content-subtle">·</span>
            <a href="mailto:info@techxserve.com" className="text-brand-600 hover:underline">
              info@techxserve.com
            </a>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
