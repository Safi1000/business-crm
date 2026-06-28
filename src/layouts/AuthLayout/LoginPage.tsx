import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, LayoutDashboard, Users, Briefcase, Zap } from 'lucide-react';
import { Button, Checkbox, FormField, Input } from '@ds/primitives';
import { useAuthStore } from '@/app/stores/auth';
import { routes } from '@/config/routes';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const FEATURES = [
  { icon: LayoutDashboard, label: 'Admin panel with ⌘K command palette' },
  { icon: Users,           label: 'Client portal for project visibility' },
  { icon: Briefcase,       label: 'Employee self-service & payroll views' },
  { icon: Zap,             label: 'Multi-currency, live FX — PKR default' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setAuthError(null);
    try {
      await signIn(values.email, values.password);
      const role = useAuthStore.getState().user?.role;
      navigate(role === 'Super Super Admin' ? routes.companies : routes.dashboard);
    } catch {
      setAuthError('Email or password is incorrect.');
    } finally {
      setSubmitting(false);
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
            <p className="text-lg font-bold leading-none tracking-tight">TechxServe</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-red-300/60">Business Platform</p>
          </div>
        </div>

        {/* Body copy */}
        <div className="relative space-y-7">
          <h2 className="font-display text-[30px] font-bold leading-tight tracking-tight">
            One platform.<br />
            <span className="text-red-300">Every team. Every workflow.</span>
          </h2>

          <p className="max-w-sm text-[14px] leading-relaxed text-red-100/60">
            A complete multi-portal business OS — Admin, Client, and Employee portals in one unified codebase. Built for businesses that refuse to be held back.
          </p>

          <div className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.3)' }}
                >
                  <Icon className="h-3.5 w-3.5 text-red-300" />
                </div>
                <span className="text-sm text-red-100/75">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[12px] text-red-950">TechxServe Business Platform v1.0</p>
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
          <div>
            <p className="font-bold text-content">TechxServe</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-content-muted">Business Platform</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-content">Welcome back</h1>
            <p className="mt-1 text-sm text-content-muted">Sign in to the TechxServe Business Platform.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" icon={Mail} placeholder="you@company.com" invalid={!!errors.email} {...register('email')} />
            </FormField>
            <FormField label="Password" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                invalid={!!errors.password}
                {...register('password')}
              />
            </FormField>

            {authError && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {authError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-content-muted">
                <Checkbox {...register('remember')} defaultChecked /> Remember me
              </label>
              <button type="button" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" loading={submitting} iconRight={ArrowRight}>
              Sign In
            </Button>
          </form>

          {/* Portal links */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs">
            <a href={routes.cpLogin} className="font-medium text-content-muted hover:text-brand-600 transition-colors">
              Client Portal →
            </a>
            <span className="text-content-subtle">·</span>
            <a href={routes.epLogin} className="font-medium text-content-muted hover:text-brand-600 transition-colors">
              Employee Portal →
            </a>
          </div>

          {/* TechxServe attribution */}
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
        </motion.div>
      </div>
    </div>
  );
}
