import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = config.smtpUrl ? nodemailer.createTransport(config.smtpUrl) : null;

export async function sendEmail({ to, subject, text }) {
  if (!transporter || !to) return false;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'HomeServe <notifications@homeserve.local>',
      to,
      subject,
      text,
    });
    return true;
  } catch (error) {
    console.error('Email delivery failed', error.message);
    return false;
  }
}
