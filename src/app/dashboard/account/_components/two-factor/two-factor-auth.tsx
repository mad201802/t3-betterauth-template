"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Enable2FAForm } from "./enable-2fa-form";
import { Manage2FASection } from "./manage-2fa-section";
import { TwoFactorSetupDialog } from "./setup/two-factor-setup-dialog";

interface TwoFactorAuthProps {
  twoFactorEnabled: boolean;
  hasCredentialsAccount: boolean;
}

export default function TwoFactorAuth({
  twoFactorEnabled: initialTwoFactorEnabled,
  hasCredentialsAccount,
}: TwoFactorAuthProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    initialTwoFactorEnabled,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [setupData, setSetupData] = useState<{
    totpUri: string;
    backupCodes: string[];
  } | null>(null);

  const handleEnableSuccess = (data: {
    totpUri: string;
    backupCodes: string[];
  }) => {
    setSetupData(data);
    setDialogOpen(true);
  };

  const handleSetupComplete = () => {
    setTwoFactorEnabled(true);
    setSetupData(null);
  };

  const handleDisableSuccess = () => {
    setTwoFactorEnabled(false);
  };

  if (!hasCredentialsAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Two-factor authentication is only available for accounts with
            email/password login. Please add a password to your account first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          {twoFactorEnabled && (
            <Badge variant="default" className="bg-green-600">
              Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!twoFactorEnabled ? (
          <Enable2FAForm onSuccess={handleEnableSuccess} />
        ) : (
          <Manage2FASection onDisableSuccess={handleDisableSuccess} />
        )}

        {setupData && (
          <TwoFactorSetupDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            totpUri={setupData.totpUri}
            backupCodes={setupData.backupCodes}
            onSuccess={handleSetupComplete}
          />
        )}
      </CardContent>
    </Card>
  );
}
