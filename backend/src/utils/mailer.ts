import nodemailer from 'nodemailer';

// Create reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,       // your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not your login password)
  }
});

// Verify connection on startup (optional but helpful during dev)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Mailer connection error:', error.message);
  } else {
    console.log('✅ Mailer ready to send emails');
  }
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: MailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"ThriftTreasure" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error: any) {
    // Log but don't crash the order flow
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
}