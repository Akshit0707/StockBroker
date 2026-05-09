import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models';
import { registerSchema } from '../../schemas/authSchema';
import type { UserResponse } from '../../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password, firstName, lastName } = validation.data;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create(
      { email, password, firstName, lastName },
      passwordHash,
    );

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      balance: Number(user.balance) / 100,
      createdAt: user.created_at,
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};