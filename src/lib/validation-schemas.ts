import { z } from "zod";
import { APP_CONFIG } from "@/config";

/**
 * Shared email validation schema
 * RFC 5321 compliant with max 254 characters
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(APP_CONFIG.auth.emailMinLength)
  .max(APP_CONFIG.auth.emailMaxLength) // RFC 5321
  .toLowerCase()
  .trim()
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Invalid email format",
  );

/**
 * Shared password validation schema
 * Minimum 8 characters
 */
export const passwordSchema = z
  .string()
  .min(
    APP_CONFIG.auth.passwordMinLength,
    `Password must be at least ${APP_CONFIG.auth.passwordMinLength} characters long`,
  );

/**
 * Helper to create a password confirmation schema
 * Returns a schema that validates password and confirmPassword match
 */
export function createPasswordConfirmationSchema() {
  return z
    .object({
      password: passwordSchema,
      confirmPassword: z.string().min(APP_CONFIG.auth.passwordMinLength),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
}

/**
 * Helper to create a password change schema with current password
 */
export function createPasswordChangeSchema() {
  return z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });
}
