
import { Disable2FASection } from "./setup/disable-2fa-section";
import { GenerateBackupCodesSection } from "./setup/generate-backup-codes-section";

interface Manage2FASectionProps {
  onDisableSuccess: () => void;
}

export function Manage2FASection({ onDisableSuccess }: Manage2FASectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <GenerateBackupCodesSection />
      <Disable2FASection onDisableSuccess={onDisableSuccess} />
    </div>
  );
}
