import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure =
    process.env.EMAIL_SECURE?.toLowerCase() === "true" || port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Bag Store 👜" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending failed:", error?.message || error);
    // Don't throw - log and continue to not block order creation
  }
}
