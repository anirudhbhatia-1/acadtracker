import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid university email'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState(() => {
    return searchParams.get('expired') === 'true'
      ? 'Your session has expired. Please log in again.'
      : null;
  });

  useEffect(() => {
    document.title = 'Sign In — AcadTracker';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (!user.isOnboarded) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (error) {
      setAuthError(error.message);
      toast.error(error.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-ink dark:text-chalk-teal">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">AcadTracker</h1>
          <p className="text-sm text-text-muted">Sign in to manage your academic progress & CGPA</p>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4 space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password below to access your space</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-0 space-y-4">
              {authError && (
                <div className="rounded-md bg-status-critical/10 border border-status-critical/20 p-3 text-xs text-status-critical flex items-center justify-between">
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-status-critical mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-status-critical mt-1">{errors.password.message}</p>}
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-6 flex flex-col space-y-4">
              <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="text-center text-xs text-text-muted">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-semibold text-ink dark:text-chalk-teal underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-xs text-text-soft">
          <p>Protected by HTTP-Only JWT Cookies & Strict Rate Limiting</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
