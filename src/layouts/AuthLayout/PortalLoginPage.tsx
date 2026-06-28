import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Input, FormField, Checkbox } from '@ds/primitives';
import { useAuthStore } from '@/app/stores/auth';

interface PortalLoginPageProps {
  title: string;
  subtitle: string;
  redirectTo: string;
  poweredBy?: boolean;
  emailLabel?: string;
}

/** Shared split-panel login for the Client & Employee portals (C2.1 / E2.1). */
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
    <div className="grid min-h-screen lg:grid-cols-[45%_55%]">

      {/* ── Brand panel ── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ background: 'linear-gradient(145deg, #1a0000 0%, #3d0000 55%, #5c0000 100%)' }}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.3), transparent 65%)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18), transparent 65%)' }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
        </div>

        {/* Logo mark */}
        <div className="relative flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-white shadow-lg"
            style={{ background: 'rgba(220,38,38,0.35)', border: '1px solid rgba(220,38,38,0.5)' }}
          >
            T
          </div>
          <div>
            <p className="text-lg font-bold leading-none tracking-tight" style={{ color: 'white' }}>TechxServe</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>Business Platform</p>
          </div>
        </div>

        {/* Body copy */}
        <div className="relative space-y-6">
          <h2 className="font-display text-[28px] font-bold leading-tight tracking-tight" style={{ color: 'white' }}>
            {title}
          </h2>
          <p className="max-w-sm text-[14px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {subtitle}
          </p>
          <div className="flex flex-col gap-3">
            {['Secure, role-based access', 'Real-time project & account visibility', 'Built for teams that move fast'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.5)' }} />
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>TechxServe Business Platform</p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-col items-center justify-center bg-app px-6 py-12">

        {/* Mobile brand */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
            style={{ background: 'rgb(220,38,38)' }}
          >
            T
          </div>
          <p className="font-bold text-content">TechxServe</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-content">{title}</h1>
            <p className="mt-1 text-sm text-content-muted">{subtitle}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
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

          {poweredBy && (
            <div className="mt-8 border-t border-line pt-6 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-content-subtle mb-3">
                Built by TechxServe
              </p>
              <div className="flex items-center justify-center gap-3 text-sm font-semibold">
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
        </motion.div>
      </div>
    </div>
  );
}
