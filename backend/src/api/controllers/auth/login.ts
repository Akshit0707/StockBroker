import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../../models';
import { loginSchema } from '../../schemas/authSchema';
import type { UserResponse } from '../../types';
import { generateToken } from '../../../utils/jwt';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = validation.data;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const response: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      balance: Number(user.balance) / 100,
      createdAt: user.created_at,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: response,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};