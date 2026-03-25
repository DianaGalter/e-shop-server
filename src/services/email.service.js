const nodemailer = require("nodemailer");

const mailTransport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const publicBaseUrl =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

const sendMail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn(
      "Email skipped: EMAIL_FROM or EMAIL_APP_PASSWORD is not configured.",
    );
    return;
  }
  await mailTransport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });
};

const sendVerificationEmail = async (recipientEmail, verificationToken, recipientName) => {
  const verifyLink = `${publicBaseUrl}/verify-email/${verificationToken}`;
  const subject = "Verify your account";
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h1>Welcome</h1>
      <p>Hello ${recipientName},</p>
      <p>Please confirm your email by clicking the link below (valid 24 hours):</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
    </div>`;
  const text = `Hello ${recipientName}, verify your email: ${verifyLink}`;
  await sendMail({ to: recipientEmail, subject, html, text });
};

const sendResetPasswordEmail = async (recipientEmail, resetToken) => {
  const resetLink = `${publicBaseUrl}/reset-password/${resetToken}`;
  const subject = "Password reset";
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h1>Reset password</h1>
      <p>Use this one-time link (valid 1 hour):</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
    </div>`;
  const text = `Reset your password: ${resetLink}`;
  await sendMail({ to: recipientEmail, subject, html, text });
};

const send2FACode = async (recipientEmail, verificationCode) => {
  const subject = "Admin login verification code";
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h1>Your verification code</h1>
      <p style="font-size:24px;letter-spacing:4px;">${verificationCode}</p>
      <p>This code expires in 10 minutes.</p>
    </div>`;
  const text = `Your admin verification code: ${verificationCode} (expires in 10 minutes)`;
  await sendMail({ to: recipientEmail, subject, html, text });
};

const sendOrderConfirmation = async (recipientEmail, orderDocument) => {
  const subject = `Order confirmation #${orderDocument._id}`;
  const itemsList = orderDocument.items
    .map(
      (orderItem) =>
        `<li>${orderItem.name} × ${orderItem.quantity} — ${orderItem.price} ILS</li>`,
    )
    .join("");
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h1>Thank you for your order</h1>
      <p>Order total: <strong>${orderDocument.totalPrice}</strong> ILS (shipping ${orderDocument.shippingCost})</p>
      <ul>${itemsList}</ul>
    </div>`;
  const text = `Order ${orderDocument._id} confirmed. Total ${orderDocument.totalPrice} ILS.`;
  await sendMail({ to: recipientEmail, subject, html, text });
};

const sendOrderStatusUpdate = async (
  recipientEmail,
  orderId,
  newOrderStatus,
) => {
  const subject = `Order ${orderId} — status update`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <h1>Order status updated</h1>
      <p>Your order <strong>${orderId}</strong> is now: <strong>${newOrderStatus}</strong>.</p>
    </div>`;
  const text = `Order ${orderId} status is now ${newOrderStatus}.`;
  await sendMail({ to: recipientEmail, subject, html, text });
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  send2FACode,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
};
