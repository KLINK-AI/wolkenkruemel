// Brevo (formerly SendinBlue) email service
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

if (!process.env.BREVO_API_KEY) {
  console.warn("BREVO_API_KEY environment variable not set - email functionality will be disabled");
} else {
  console.log("Brevo API key configured - email functionality enabled");
  console.log("API key starts with:", process.env.BREVO_API_KEY.substring(0, 20) + "...");
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
    console.log(`Attempting to send email to: ${params.to}`);
    console.log(`Using API key: ${process.env.BREVO_API_KEY.substring(0, 20)}...`);
    
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: "Wolkenkrümel Team",
          email: "stefan@gen-ai.consulting"
        },
        to: [
          {
            email: params.to,
            name: params.to.split('@')[0]
          }
        ],
        subject: params.subject,
        textContent: params.text,
        htmlContent: params.html
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Brevo API error:', response.status, responseData);
      
      // If API key is invalid, provide helpful message
      if (responseData.code === 'unauthorized' || responseData.message === 'Key not found') {
        console.error('ERROR: Brevo API key is invalid or does not have proper permissions');
        console.error('Please check your Brevo account and ensure:');
        console.error('1. The API key is correct');
        console.error('2. The API key has Email sending permissions');
        console.error('3. You have verified sender email addresses in your Brevo account');
      }
      
      return false;
    }

    console.log('Email sent successfully via Brevo:', responseData);
    return true;
  } catch (error) {
    console.error('Brevo email error:', error);
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