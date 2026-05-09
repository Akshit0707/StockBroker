import { z } from "zod";

export const RegisterValidation = z.object({
  email: z
    .string("Email must be a string")
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string("Password must be a string")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    ),
  
  firstName: z
    .string("First name must be a string")
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z
    .string("Last name must be a string")
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
})


export const LoginValidation = z.object({
  email: z
    .string("Email must be a string")
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string("Password must be a string")
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const OrdersValidation = z.object({
  stockId: z
    .string("Stock ID must be a string")
    .min(1, "Stock ID is required")
    .uuid("Invalid stock ID format"),
  quantity: z
    .number("Quantity must be a number")  
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .min(1, "Minimum quantity is 1")
    .max(100000, "Maximum order size is 100,000 shares"),
  price: z
    .number("Price must be a number")  
    .positive("Price must be greater than 0")
    .max(1000000, "Price seems too high")
    .refine((price) => price > 0.01, "Minimum price is ₹0.01"),
  orderType: z
    .enum(["BUY", "SELL"])
    .refine((type) => ["BUY", "SELL"].includes(type), {
      message: "Order type must be BUY or SELL",
    })
    .transform((val) => val.toUpperCase()),
});

export const PortfolioValidation = z.object({
  holdings: z
    .array(
      z.object({
        stockId: z.string("Stock ID must be a string").uuid("Invalid stock ID"),
        quantity: z
          .number("Quantity must be a number")
          .positive("Quantity must be positive"),
        averagePrice: z
          .number("Average price must be a number")
          .positive("Price must be positive"),
      })
    )
    .optional(),
});

export const TradingValidation = z.object({
  searchQuery: z
    .string("Search query must be a string")
    .min(1, "Search query is required")
    .max(10, "Search query too long")
    .optional(),
  minPrice: z
    .number("Min price must be a number")
    .positive("Min price must be positive")
    .optional(),
  maxPrice: z
    .number("Max price must be a number")
    .positive("Max price must be positive")
    .optional(),
}).refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: "Min price must be less than max price",
    path: ["minPrice"],
  }
);

export type RegisterFormData = z.infer<typeof RegisterValidation>;
export type LoginFormData = z.infer<typeof LoginValidation>;
export type OrderFormData = z.infer<typeof OrdersValidation>;
export type PortfolioFormData = z.infer<typeof PortfolioValidation>;
export type TradingFormData = z.infer<typeof TradingValidation>;
