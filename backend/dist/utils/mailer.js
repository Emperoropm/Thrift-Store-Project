"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create reusable transporter using Gmail
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not your login password)
    }
});
// Verify connection on startup (optional but helpful during dev)
transporter.verify((error) => {
    if (error) {
        console.error('❌ Mailer connection error:', error.message);
    }
    else {
        console.log('✅ Mailer ready to send emails');
    }
});
async function sendMail({ to, subject, html }) {
    try {
        await transporter.sendMail({
            from: `"ThriftTreasure" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent to ${to}`);
    }
    catch (error) {
        // Log but don't crash the order flow
        console.error(`❌ Failed to send email to ${to}:`, error.message);
    }
}
//# sourceMappingURL=mailer.js.map