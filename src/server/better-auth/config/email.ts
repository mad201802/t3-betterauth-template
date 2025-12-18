import { env } from "@/env";
import { Resend } from "resend";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export function sendMail(
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  if (!resend) {
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
