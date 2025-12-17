import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/server/better-auth";
import {
  IconDeviceLaptop,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconMapPin,
  IconCalendar,
  IconClock,
} from "@tabler/icons-react";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

function getDeviceIcon(userAgent?: string | null) {
  if (!userAgent) return <IconDeviceDesktop className="h-5 w-5" />;
  const ua = userAgent.toLowerCase();
  if (
    ua.includes("mobile") ||
    ua.includes("android") ||
    ua.includes("iphone")
  ) {
    return <IconDeviceMobile className="h-5 w-5" />;
  }
  if (ua.includes("tablet") || ua.includes("ipad")) {
    return <IconDeviceLaptop className="h-5 w-5" />;
  }
  return <IconDeviceDesktop className="h-5 w-5" />;
}

function getDeviceName(userAgent?: string | null) {
  if (!userAgent) return "Unknown Device";

  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = "Unknown Browser";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  // OS detection
  let os = "Unknown OS";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  return `${browser} on ${os}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export default async function ViewSessions() {
  const sessions = await auth.api.listSessions({
    headers: await headers(),
  });

  const currentSession = await auth.api.getSession({
    headers: await headers(),
  });

  const sortedSessions = [...sessions].sort((a, b) => {
    const aIsCurrent = a.token === currentSession?.session.token;
    const bIsCurrent = b.token === currentSession?.session.token;
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          View and manage your active sessions across all devices. You have{" "}
          {sessions.length} active{" "}
          {sessions.length === 1 ? "session" : "sessions"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-center">
            <IconDeviceLaptop className="mb-4 h-12 w-12 opacity-50" />
            <p className="text-sm">No active sessions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map((session) => {
              const isCurrentSession =
                session.token === currentSession?.session.token;
              const expiresAt = new Date(session.expiresAt);
              const createdAt = new Date(session.createdAt);
              const isExpired = expiresAt < new Date();

              return (
                <div
                  key={session.id}
                  className={`border-border flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isCurrentSession ? "bg-muted/50" : "hover:bg-muted/30"
                  }`}
                >
                  <div className="text-muted-foreground mt-1">
                    {getDeviceIcon(session.userAgent)}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">
                          {getDeviceName(session.userAgent)}
                        </h4>
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                          {session.ipAddress && (
                            <span className="flex items-center gap-1">
                              <IconMapPin className="h-3.5 w-3.5" />
                              {session.ipAddress}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <IconCalendar className="h-3.5 w-3.5" />
                            {formatDate(createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrentSession && (
                          <Badge variant="default" className="shrink-0">
                            Current Session
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="shrink-0">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="flex items-center gap-1">
                        <IconClock className="h-3.5 w-3.5" />
                        Active {getTimeAgo(createdAt)}
                      </span>
                      <span>Expires: {formatDate(expiresAt)}</span>
                    </div>

                    {!isCurrentSession && !isExpired && (
                      <form>
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          formAction={async () => {
                            "use server";
                            await auth.api.revokeSession({
                              body: {
                                token: session.token,
                              },
                              headers: await headers(),
                            });
                            revalidatePath("/dashboard/account");
                          }}
                        >
                          Revoke session
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
