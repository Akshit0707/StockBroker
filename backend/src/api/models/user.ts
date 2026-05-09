import { query } from '../../utils/db';
import type { User, UserRegisterInput } from '../types';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      `SELECT 
         id,
         email,
         password_hash,
         first_name,
         last_name,
         balance,
         created_at,
         updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      `SELECT 
         id,
         email,
         password_hash,
         first_name,
         last_name,
         balance,
         created_at,
         updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()],
    );
    return result.rows[0] || null;
  }

  static async create(input: UserRegisterInput, passwordHash: string): Promise<User> {
    const result = await query(
      `INSERT INTO users (
         email,
         password_hash,
         first_name,
         last_name,
         balance
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING 
         id,
         email,
         password_hash,
         first_name,
         last_name,
         balance,
         created_at,
         updated_at`,
      [input.email.toLowerCase(), passwordHash, input.firstName, input.lastName, 10000000],
    );
    return result.rows[0];
  }

  static async updateBalance(userId: string, amount: number): Promise<User> {
    const result = await query(
      `UPDATE users
       SET balance = balance + $1
       WHERE id = $2
       RETURNING 
         id,
         email,
         password_hash,
         first_name,
         last_name,
         balance,
         created_at,
         updated_at`,
      [amount, userId],
    );
    return result.rows[0];
  }
}