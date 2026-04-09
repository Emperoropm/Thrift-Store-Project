interface MailOptions {
    to: string;
    subject: string;
    html: string;
}
export declare function sendMail({ to, subject, html }: MailOptions): Promise<void>;
export {};
//# sourceMappingURL=mailer.d.ts.map