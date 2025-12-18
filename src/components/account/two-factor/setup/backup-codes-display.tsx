import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BackupCodesDisplayProps {
  backupCodes: string[];
  title?: string;
  description?: string;
}

export function BackupCodesDisplay({
  backupCodes,
  title = "Backup Codes",
  description = "Store these backup codes in a safe place. You can use them to access your account if you lose your device.",
}: BackupCodesDisplayProps) {
  const copyBackupCodes = () => {
    void navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-2">
      {title && <h4 className="font-medium">{title}</h4>}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
      <div className="bg-muted flex flex-col gap-2 rounded-lg p-2">
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index}>{code}</div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyBackupCodes}
        >
          Copy Codes
        </Button>
      </div>
    </div>
  );
}
