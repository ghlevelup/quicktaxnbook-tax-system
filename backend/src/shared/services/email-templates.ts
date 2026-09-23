import config from '@/config/config';

const PRIMARY = '#0d9488';
const TEXT = '#18181b';
const MUTED = '#71717a';
const BORDER = '#e4e4e7';

interface LayoutOptions {
  preheader?: string;
  heading: string;
  bodyHtml: string;
}

/** Shared HTML shell every transactional email renders inside. */
const layout = ({ preheader, heading, bodyHtml }: LayoutOptions): string => `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${config.appName}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
            <tr>
              <td style="background-color:${PRIMARY};padding:20px 32px;">
                <span style="font-size:18px;font-weight:700;color:#ffffff;">${config.appName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:${TEXT};">${heading}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BORDER};">
                <p style="margin:0;font-size:12px;color:${MUTED};">
                  ${config.appName}. This is an automated message, please don't reply directly.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const otpBlock = (code: string, expiresInMinutes: number): string => `
  <div style="margin:24px 0;padding:20px;background-color:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;text-align:center;">
    <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${PRIMARY};">${code}</span>
  </div>
  <p style="margin:0;font-size:14px;color:${MUTED};">This code expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email.</p>
`;

const button = (href: string, label: string): string => `
  <a href="${href}" style="display:inline-block;margin:20px 0;padding:12px 24px;background-color:${PRIMARY};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>
`;

export const otpEmailTemplate = (code: string, expiresInMinutes: number) =>
  layout({
    heading: 'Your login code',
    preheader: `Your login code is ${code}`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:14px;color:${TEXT};">Enter this code to finish signing in:</p>
      ${otpBlock(code, expiresInMinutes)}
    `,
  });

export const passwordResetOtpEmailTemplate = (code: string, expiresInMinutes: number) =>
  layout({
    heading: 'Reset your password',
    preheader: `Your password reset code is ${code}`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:14px;color:${TEXT};">A password reset was requested for your account. Enter this code to continue:</p>
      ${otpBlock(code, expiresInMinutes)}
    `,
  });

export const firmAdminWelcomeEmailTemplate = (firmName: string, loginUrl: string) =>
  layout({
    heading: `Welcome to ${config.appName}`,
    preheader: `Your firm account for ${firmName} is ready`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:14px;color:${TEXT};">
        A firm account for <strong>${firmName}</strong> has been created and you've been set up as the Firm Admin.
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:${TEXT};">
        Your platform administrator will share your login credentials with you separately.
      </p>
      ${button(loginUrl, 'Go to login')}
    `,
  });

export const onboardingLinkEmailTemplate = (firmName: string, onboardingUrl: string) =>
  layout({
    heading: `${firmName} invited you to set up your portal`,
    preheader: `Complete your onboarding with ${firmName}`,
    bodyHtml: `
      <p style="margin:0 0 12px;font-size:14px;color:${TEXT};">
        ${firmName} has invited you to set up your client portal account.
      </p>
      ${button(onboardingUrl, 'Complete onboarding')}
      <p style="margin:12px 0 0;font-size:13px;color:${MUTED};">This link will expire, so please complete it soon. If you weren't expecting this, you can ignore this email.</p>
    `,
  });
