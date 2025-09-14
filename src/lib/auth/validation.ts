// lib/auth/validation.ts
import { z } from "zod";

// Reserved usernames that should not be allowed
const RESERVED_USERNAMES = [
  "admin",
  "root",
  "user",
  "test",
  "api",
  "www",
  "mail",
  "ftp",
  "support",
  "help",
  "info",
  "contact",
  "about",
  "terms",
  "privacy",
  "login",
  "register",
  "signin",
  "signup",
  "auth",
  "account",
  "profile",
  "settings",
  "dashboard",
  "home",
  "index",
  "null",
  "undefined",
  "true",
  "false",
];

// Email validation schema
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  );

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-z0-9_\.]+$/,
    "Username can only contain lowercase letters, numbers, underscores, and dots"
  )
  .refine(
    (username) => !RESERVED_USERNAMES.includes(username.toLowerCase()),
    "This username is reserved and cannot be used"
  )
  .refine(
    (username) => !username.startsWith(".") && !username.endsWith("."),
    "Username cannot start or end with a dot"
  )
  .refine(
    (username) => !username.includes(".."),
    "Username cannot contain consecutive dots"
  );

// Link email/password form schema
export const linkEmailPasswordSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Sign in schema
export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) => {
        // If it contains @, validate as email
        if (value.includes("@")) {
          return emailSchema.safeParse(value).success;
        }
        // Otherwise validate as username
        return usernameSchema.safeParse(value).success;
      },
      "Please enter a valid email or username"
    ),
  password: z.string().min(1, "Password is required"),
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Set username schema
export const setUsernameSchema = z.object({
  username: usernameSchema,
});

// Password strength helper
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include lowercase letters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include uppercase letters");
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Include numbers");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
    feedback.splice(0, 0, "Great! Special characters make it stronger");
  }

  if (password.length >= 12) {
    score += 1;
  }

  return { score, feedback };
}

// Type exports for use in components
export type LinkEmailPasswordData = z.infer<typeof linkEmailPasswordSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type SetUsernameData = z.infer<typeof setUsernameSchema>;