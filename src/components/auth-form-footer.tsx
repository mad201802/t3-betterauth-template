import { FieldDescription } from "@/components/ui/field";
import { APP_CONFIG } from "@/config";

/**
 * Shared footer component for auth pages
 * Displays terms of service and privacy policy links
 */
export function AuthFormFooter() {
  return (
    <FieldDescription className="px-6 text-center">
      By clicking continue, you agree to our{" "}
      <a href={APP_CONFIG.links.termsOfService}>Terms of Service</a> and{" "}
      <a href={APP_CONFIG.links.privacyPolicy}>Privacy Policy</a>.
    </FieldDescription>
  );
}
