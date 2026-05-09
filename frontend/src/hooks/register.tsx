'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ZodError } from 'zod';
import type { RegisterFormData } from '../utils/validation';
import { RegisterValidation } from '../utils/validation';
import { authApi } from '../services/api';
import useAuthStore from '../store/authStore';

export const useRegister = () => {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const validated = RegisterValidation.parse(data);
      const response = await authApi.register(validated);
      const { user, token } = response.data.data;

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
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleRegister, isSubmitting, errors };
};
