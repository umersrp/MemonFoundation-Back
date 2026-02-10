const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // or "hotmail", "yahoo", etc.
    auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // Gmail App Password if 2FA enabled
    },
});

export const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
        from: process.env.ADMIN_EMAIL,
        to,
        subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
};
