import nodemailer from 'nodemailer';

import config from '@/config/config';
import logger from '@/config/logger';

export const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('💌 Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transport.sendMail(msg);
};

export const sendOtpEmail = async (to: string, code: string, expiresInMinutes: number) => {
  const subject = `${code} is your ${config.appName} login code`;
  const text = `Your login code is: ${code}\n\nThis code expires in ${expiresInMinutes} minutes. If you didn't request this, you can safely ignore this email.`;
  await sendEmail(to, subject, text);
};

export const sendFirmAdminWelcomeEmail = async (to: string, firmName: string, loginUrl: string) => {
  const subject = `Your ${config.appName} firm account is ready`;
  const text = `Welcome to ${config.appName}!

A firm account for "${firmName}" has been created and you've been set up as the Firm Admin.

Login here: ${loginUrl}

Your platform administrator will share your login credentials with you separately.`;
  await sendEmail(to, subject, text);
};

export const sendOnboardingLinkEmail = async (
  to: string,
  firmName: string,
  onboardingUrl: string
) => {
  const subject = `Complete your onboarding with ${firmName}`;
  const text = `Hello,

${firmName} has invited you to set up your client portal account.

Complete your onboarding here: ${onboardingUrl}

This link will expire, so please complete it soon. If you weren't expecting this, you can ignore this email.`;
  await sendEmail(to, subject, text);
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const subject = `Reset your ${config.appName} password`;
  const text = `A password reset was requested for your account.

Reset your password here: ${resetUrl}

If you did not request this, you can safely ignore this email — your password will not change.`;
  await sendEmail(to, subject, text);
};
