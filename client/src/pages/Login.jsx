import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
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
  const { login, isLoading } = useAuthStore();
  const [authError, setAuthError] = useState(null);

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-lg shadow-primary/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">AcadTracker</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your academic progress & CGPA</p>
        </div>

        <Card className="border-border/60 bg-card/80 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password below to access your space</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center justify-between">
                  <span>{authError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full shadow-md" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-xs text-muted-foreground/60">
          <p>Protected by HTTP-Only JWT Cookies & Strict Rate Limiting</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
