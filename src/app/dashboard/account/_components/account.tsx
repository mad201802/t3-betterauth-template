"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import {
  IconBrandGithub,
  IconBrandGoogleFilled,
  IconMailFilled,
  IconTrash,
  type IconProps,
} from "@tabler/icons-react";
import {
  useState,
  useEffect,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config";

interface Account {
  accountId: string;
  providerId: string;
  createdAt: Date;
}

interface AccountProps {
  userAccounts: Account[];
  configuredProviders: string[];
}

const providerDisplayNames: Record<
  string,
  {
    name: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  }
> = {
  github: {
    name: "GitHub",
    icon: IconBrandGithub,
  },
  google: {
    name: "Google",
    icon: IconBrandGoogleFilled,
  },
  credential: {
    name: "Email",
    icon: IconMailFilled,
  },
};

export default function Account({
  userAccounts,
  configuredProviders,
}: AccountProps) {
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("error") === "email_doesn't_match") {
      toast.error("The account email does not match.");
    }
  }, [searchParams]);

  const handleLinkProvider = async (providerId: string) => {
    setIsLinking(providerId);
    try {
      await authClient.linkSocial({
        provider: providerId as "github" | "google",
        callbackURL: APP_CONFIG.routes.accountSettings,
        errorCallbackURL: APP_CONFIG.routes.accountSettings,
      });
    } catch (error) {
      console.error("Failed to link provider:", error);
      toast.error(`Failed to link ${providerDisplayNames[providerId]?.name}`);
    } finally {
      setIsLinking(null);
    }
  };

  const handleUnlinkProvider = async (
    accountId: string,
    providerId: string,
    providerName: string,
  ) => {
    setIsUnlinking(accountId);
    try {
      const { error } = await authClient.unlinkAccount({
        providerId,
        accountId,
      });

      if (error) {
        toast.error(error.message ?? `Failed to unlink ${providerName}`);
        return;
      }

      toast.success(`${providerName} account unlinked successfully`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to unlink provider:", error);
      toast.error(`Failed to unlink ${providerName}`);
    } finally {
      setIsUnlinking(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          Link your account to third-party authentication providers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {configuredProviders
          .filter((p) => p !== "credential")
          .map((providerId) => {
            const connected = userAccounts.find(
              (p) => p.providerId === providerId,
            );
            const providerInfo = providerDisplayNames[providerId];
            const displayName = providerInfo?.name ?? providerId;
            const Icon = providerInfo?.icon;

            return (
              <div
                key={providerId}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                    {Icon ? (
                      <Icon size={20} />
                    ) : (
                      <span className="text-sm font-semibold">
                        {displayName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{displayName}</p>
                    {connected && (
                      <p className="text-muted-foreground text-xs">
                        {connected.accountId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {connected ? (
                    <>
                      <p className="text-muted-foreground text-xs">
                        Connected on {formatDate(connected.createdAt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnlinkProvider(
                            connected.accountId,
                            providerId,
                            displayName,
                          )
                        }
                        disabled={isUnlinking === connected.accountId}
                      >
                        <IconTrash
                          size={16}
                          className="text-muted-foreground hover:text-destructive"
                        />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkProvider(providerId)}
                      disabled={isLinking === providerId}
                    >
                      {isLinking === providerId
                        ? "Linking..."
                        : `Link ${displayName}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
