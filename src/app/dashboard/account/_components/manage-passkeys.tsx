"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/server/better-auth/client";
import {
  IconKey,
  IconTrash,
  IconEdit,
  IconPlus,
  IconDeviceLaptop,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface Passkey {
  id: string;
  name?: string;
  createdAt: Date;
  deviceType: string;
  backedUp: boolean;
}

export default function ManagePasskeys() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [isDeletingPasskey, setIsDeletingPasskey] = useState<string | null>(
    null,
  );
  const [editingPasskey, setEditingPasskey] = useState<Passkey | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState("");
  const [editPasskeyName, setEditPasskeyName] = useState("");

  useEffect(() => {
    void loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    try {
      const { data, error } = await authClient.passkey.listUserPasskeys();
      if (error) {
        toast.error("Failed to load passkeys");
        return;
      }
      setPasskeys(data || []);
    } catch (error) {
      console.error("Failed to load passkeys:", error);
      toast.error("Failed to load passkeys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPasskey = async () => {
    setIsAddingPasskey(true);
    try {
      const { error } = await authClient.passkey.addPasskey({
        name: newPasskeyName.trim() || undefined,
      });

      if (error) {
        toast.error(error.message ?? "Failed to add passkey");
        return;
      }

      toast.success("Passkey added successfully");
      setNewPasskeyName("");
      await loadPasskeys();
    } catch (error) {
      console.error("Failed to add passkey:", error);
      toast.error("Failed to add passkey");
    } finally {
      setIsAddingPasskey(false);
    }
  };

  const handleDeletePasskey = async (id: string, name?: string) => {
    setIsDeletingPasskey(id);
    try {
      const { error } = await authClient.passkey.deletePasskey({
        id,
      });

      if (error) {
        toast.error(error.message ?? "Failed to delete passkey");
        return;
      }

      toast.success(`Passkey "${name ?? "Unnamed"}" deleted successfully`);
      await loadPasskeys();
    } catch (error) {
      console.error("Failed to delete passkey:", error);
      toast.error("Failed to delete passkey");
    } finally {
      setIsDeletingPasskey(null);
    }
  };

  const handleUpdatePasskey = async () => {
    if (!editingPasskey) return;

    try {
      const { error } = await authClient.passkey.updatePasskey({
        id: editingPasskey.id,
        name: editPasskeyName.trim(),
      });

      if (error) {
        toast.error(error.message ?? "Failed to update passkey");
        return;
      }

      toast.success("Passkey renamed successfully");
      setEditingPasskey(null);
      setEditPasskeyName("");
      await loadPasskeys();
    } catch (error) {
      console.error("Failed to update passkey:", error);
      toast.error("Failed to update passkey");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getDeviceIcon = (deviceType: string) => {
    if (deviceType === "platform") {
      return <IconDeviceLaptop size={20} />;
    }
    return <IconDeviceMobile size={20} />;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <CardDescription>
            Manage your passkeys for passwordless authentication. Passkeys
            provide a secure way to sign in using biometrics or your
            device&apos;s security.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Add Passkey Section */}
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <IconPlus size={20} />
              <h3 className="font-semibold">Add New Passkey</h3>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Label htmlFor="passkey-name" className="sr-only">
                  Passkey Name
                </Label>
                <Input
                  id="passkey-name"
                  placeholder="Enter a name for your passkey (optional)"
                  value={newPasskeyName}
                  onChange={(e) => setNewPasskeyName(e.target.value)}
                  disabled={isAddingPasskey}
                />
              </div>
              <Button
                onClick={handleAddPasskey}
                disabled={isAddingPasskey}
                className="sm:w-auto"
              >
                {isAddingPasskey ? "Adding..." : "Add Passkey"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              You&apos;ll be prompted to use your device&apos;s biometrics or
              security key to create a passkey.
            </p>
          </div>

          {/* Passkeys List */}
          {isLoading ? (
            <div className="text-muted-foreground flex justify-center py-8">
              Loading passkeys...
            </div>
          ) : passkeys.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-8 text-center">
              <IconKey size={40} className="opacity-50" />
              <p className="text-sm">
                No passkeys found. Add your first passkey to enable passwordless
                authentication.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      {getDeviceIcon(passkey.deviceType)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {passkey.name ?? "Unnamed Passkey"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Added on {formatDate(passkey.createdAt)}
                        {passkey.backedUp && " • Backed up"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPasskey(passkey);
                        setEditPasskeyName(passkey.name ?? "");
                      }}
                    >
                      <IconEdit
                        size={16}
                        className="text-muted-foreground hover:text-foreground"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeletePasskey(passkey.id, passkey.name)
                      }
                      disabled={isDeletingPasskey === passkey.id}
                    >
                      <IconTrash
                        size={16}
                        className="text-muted-foreground hover:text-destructive"
                      />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Passkey Dialog */}
      <Dialog
        open={!!editingPasskey}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPasskey(null);
            setEditPasskeyName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Passkey</DialogTitle>
            <DialogDescription>
              Enter a new name for your passkey to help you identify it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-passkey-name">Passkey Name</Label>
            <Input
              id="edit-passkey-name"
              placeholder="Enter passkey name"
              value={editPasskeyName}
              onChange={(e) => setEditPasskeyName(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingPasskey(null);
                setEditPasskeyName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePasskey}
              disabled={!editPasskeyName.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
