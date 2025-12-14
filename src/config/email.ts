import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY as string | undefined);

export function sendMail(
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.log("--- Email Sending Disabled ---");
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html}`);
      console.log("------------------------------");
      return Promise.resolve();
    }
    throw new Error("RESEND_API_KEY is not set. Cannot send email.");
  }

  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}
