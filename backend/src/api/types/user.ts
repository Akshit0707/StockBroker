export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}