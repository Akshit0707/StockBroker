import type { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export interface PaginationParams {
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  count: number;
  limit: number;
  offset: number;
  total: number;
}

export interface AuthUser {
  userId: string;
  email?: string;
}

export type AuthRequest = Request & {
  user?: AuthUser;
};