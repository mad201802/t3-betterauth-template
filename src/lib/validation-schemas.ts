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
