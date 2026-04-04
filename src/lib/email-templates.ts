/**
 * Email templates for transactional emails
 *
 * @module lib/email-templates
 * @description HTML email templates used for authentication flows.
 * These templates are used by BetterAuth for magic link authentication.
 *
 * Customize these templates to match your brand. Consider using a library like
 * react-email for more complex templates.
 */

interface EmailTemplateParams {
  user: string;
  url: string;
}

/**
 * Magic link email template
 *
 * @param params.user - User's email
 * @param params.url - Magic link URL
 * @returns HTML email body
 */
export function getMagicLinkEmailTemplate({
  user,
  url,
}: EmailTemplateParams): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to your account</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4f46e5, #7c3aed); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Sign in to your account</h1>
    </div>
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
      <p style="font-size: 16px; margin-bottom: 20px;">Hi ${user},</p>
      <p style="font-size: 16px; margin-bottom: 20px;">Click the button below to sign in to your account. This link will securely log you in without needing a password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">Sign In</a>
      </div>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 14px; color: #4f46e5; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${url}</p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This link will expire in 10 minutes for security reasons.</p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">If you didn't request this sign-in link, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">This is an automated message, please do not reply.</p>
    </div>
  </body>
</html>
  `.trim();
}
