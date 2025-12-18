import { useSearchParams } from "next/navigation";

export function useRedirectParam(): string | null {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  if (
    rawRedirect &&
    rawRedirect.startsWith("/") &&
    !rawRedirect.includes("://")
  ) {
    return rawRedirect;
  }
  return null;
}
