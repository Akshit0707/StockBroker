'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZodError } from 'zod';
import type { LoginFormData } from '../utils/validation';
import { LoginValidation } from '../utils/validation';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';

export const useLogin = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const validated = LoginValidation.parse(data);
      const response = await authApi.login(validated);
      const user = response.data.data;
      const token = response.data.token;

      login(user, token);
      router.push('/dashboard');
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const key = String(issue.path[0] ?? 'general');
          formErrors[key] = issue.message;
        });
        setErrors(formErrors);
      } else {
        setErrors({ general: 'Login failed. Please check your credentials.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleLogin, isSubmitting, errors };
};