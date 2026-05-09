import { User } from "./user";

export interface RegisterInput {
    email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
    email: string;
  password: string;
}

export interface AuthResponse{
    token: string;
    user: User;
}