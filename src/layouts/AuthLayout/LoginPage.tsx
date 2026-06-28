import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button, Checkbox, FormField, Input } from '@ds/primitives';
import { useAuthStore } from '@/app/stores/auth';
import { routes } from '@/config/routes';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

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
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        {/* Branded header */}
        <div
          className="relative flex flex-col items-center gap-4 overflow-hidden px-8 py-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgb(185,28,28) 0%, rgb(220,38,38) 50%, rgb(153,27,27) 100%)' }}
        >
          {/* Subtle dot grid overlay */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />
          {/* Glow blob */}
          <div
            className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-2xl"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 22 }}
            className="relative"
          >
            <img src="/logo.png" alt="TechxServe" className="h-20 w-auto brightness-0 invert" />
          </motion.div>
          <div className="relative">
            <h1 className="font-display text-xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-white/70">TechxServe Business Platform</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-8">
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
        <div className="flex items-center justify-center gap-4 border-t border-line px-8 py-4 text-xs">
          <a href={routes.cpLogin} className="font-medium text-content-muted hover:text-brand-600 transition-colors">
            Client Portal →
          </a>
          <span className="text-content-subtle">·</span>
          <a href={routes.epLogin} className="font-medium text-content-muted hover:text-brand-600 transition-colors">
            Employee Portal →
          </a>
        </div>
      </motion.div>

      {/* TechxServe attribution */}
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
    </AuthLayout>
  );
}
