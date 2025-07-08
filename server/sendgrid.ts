// Brevo SMTP email service using nodemailer
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

// Create SMTP transporter for custom mail server
const transporter = nodemailer.createTransport({
  host: "mx.configo.de",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: "stefan@gen-ai.consulting",
    pass: process.env.CUSTOM_SMTP_PASSWORD || "mD8*QA6N9J*yabMn"
  }
});

if (!process.env.BREVO_API_KEY && !process.env.BREVO_SMTP_PASS) {
  console.warn("BREVO SMTP credentials not set - email functionality will be disabled");
} else {
  console.log("Brevo SMTP configured - email functionality enabled");
  console.log("SMTP user:", process.env.BREVO_SMTP_USER || "848306026@smtp-brevo.com");
  console.log("SMTP configured with password from env variables");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) {
    console.log(`Email would be sent to: ${params.to}`);
    console.log(`Subject: ${params.subject}`);
    console.log(`Content: ${params.text || params.html}`);
    return true; // Simulate success in development
  }

  try {
    console.log(`Attempting to send email via Custom SMTP to: ${params.to}`);
    console.log('SMTP Config:', {
      host: 'mx.configo.de',
      port: 465,
      user: 'stefan@gen-ai.consulting',
      passLength: (process.env.CUSTOM_SMTP_PASSWORD || "").length
    });
    
    const mailOptions = {
      from: `"Wolkenkrümel Team" <stefan@gen-ai.consulting>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Custom SMTP:', info.messageId);
    return true;
  } catch (error) {
    console.error('Custom SMTP error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    
    // For now, let's not fail registration due to email issues
    console.log('Email sending failed, but continuing with registration...');
    return false;
  }
}

export function generateEmailVerificationTemplate(username: string, verificationUrl: string): { text: string; html: string } {
  const text = `
Hallo ${username},

willkommen bei Wolkenkrümel! Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:

${verificationUrl}

Dieser Link ist 24 Stunden gültig.

Viel Spaß beim Hundetraining!
Ihr Wolkenkrümel Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>E-Mail bestätigen - Wolkenkrümel</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px;">Willkommen bei Wolkenkrümel!</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Ihre Community für Hundetraining</p>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
    <h2 style="color: #1f2937; margin-bottom: 20px;">Hallo ${username},</h2>
    <p style="margin-bottom: 20px;">vielen Dank für Ihre Anmeldung bei Wolkenkrümel! Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        E-Mail bestätigen
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
      Dieser Link ist 24 Stunden gültig.
    </p>
  </div>
  
  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 14px; color: #6b7280; text-align: center;">
    <p>Viel Spaß beim Hundetraining!</p>
    <p><strong>Ihr Wolkenkrümel Team</strong></p>
  </div>
</body>
</html>
`;

  return { text, html };
}