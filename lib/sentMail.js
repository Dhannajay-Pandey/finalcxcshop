import nodemailer from "nodemailer";

export async function sendEmail(to, subject, body) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_HOST,
      port: Number(process.env.NODEMAILER_PORT),
      secure: Number(process.env.NODEMAILER_PORT) === 465,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CX Store" <${process.env.NODEMAILER_USER}>`,
      to,
      subject,
      html: body,
    });

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}