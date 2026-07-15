import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { GraduationCap, Lock, Mail, User, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/button';
import Input from '../components/ui/input';
import Label from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Enter a valid university email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Register = () => {
  const navigate = useNavigate();
  const { register: registerAction, isLoading } = useAuthStore();
  const [registerError, setRegisterError] = useState(null);

  useEffect(() => {
    document.title = 'Create Account — AcadTracker';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data) => {
    setRegisterError(null);
    try {
      const user = await registerAction(data.name, data.email, data.password);
      toast.success(`Account created successfully! Welcome, ${user.name}`);
      navigate('/onboarding', { replace: true });
    } catch (error) {
      setRegisterError(error.message);
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 border border-border text-ink dark:text-chalk-teal">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Create your Account</h1>
          <p className="text-sm text-text-muted">Join AcadTracker to automate your attendance and grade tracking</p>
        </div>

        <Card className="p-6">
          <CardHeader className="p-0 pb-4 space-y-1">
            <CardTitle className="text-xl">Student Registration</CardTitle>
            <CardDescription>Enter your personal and university details below</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-0 space-y-4">
              {registerError && (
                <div className="rounded-md bg-status-critical/10 border border-status-critical/20 p-3 text-xs text-status-critical flex items-center justify-between">
                  <span>{registerError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Alex Johnson"
                    className="pl-9"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="text-xs text-status-critical mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">University Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@university.edu"
                    className="pl-9"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-status-critical mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    className="pl-9"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-status-critical mt-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    className="pl-9"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-status-critical mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-0 pt-6 flex flex-col space-y-4">
              <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <div className="text-center text-xs text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-ink dark:text-chalk-teal underline-offset-4 hover:underline">
                  Sign in here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
