import nodemailer from "nodemailer"

// Create reusable transporter object using the SMTP credentials provided
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true" || true, // 465 is SSL
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER || "guptaronak243@gmail.com",
    pass: process.env.SMTP_PASS || process.env.GMAIL_PASS || "kmqslavutznjeerq",
  },
})

export async function sendWelcomeEmail({
  to,
  fullName,
  temporaryPassword,
  role,
  companyName,
  appUrl,
}: {
  to: string
  fullName: string
  temporaryPassword?: string
  role?: string
  companyName?: string
  appUrl?: string
}) {
  const loginUrl = appUrl || "http://localhost:5173"
  const fromAddress = process.env.SMTP_FROM || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0f172a; padding: 28px; text-align: center; border-bottom: 3px solid #ff4e00; }
        .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .body-text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .cred-card { background: #fff7ed; border: 1px solid #ffedd5; border-left: 4px solid #ff4e00; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; }
        .cred-item { margin-bottom: 10px; font-size: 14px; }
        .cred-item:last-child { margin-bottom: 0; }
        .cred-label { font-weight: 600; color: #7c2d12; display: inline-block; width: 140px; }
        .cred-val { font-family: monospace; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #fed7aa; color: #9a3412; font-weight: 600; }
        .action-area { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; background-color: #ff4e00; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 6px; font-size: 14px; box-shadow: 0 2px 4px rgba(255,78,0,0.3); }
        .note { font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RRM • Reliable Risk Management</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello ${fullName || "User"},</div>
          <div class="body-text">
            Your account has been created on the <strong>RRM (Reliable Risk Management) Portal</strong> for <strong>${companyName || "Organization"}</strong> with role <strong>${role || "Staff"}</strong>.
            You can now log in using the temporary credentials below:
          </div>

          <div class="cred-card">
            <div class="cred-item">
              <span class="cred-label">Login Email:</span>
              <span class="cred-val">${to}</span>
            </div>
            ${
              temporaryPassword
                ? `<div class="cred-item">
                    <span class="cred-label">Temporary Password:</span>
                    <span class="cred-val">${temporaryPassword}</span>
                  </div>`
                : ""
            }
          </div>

          <div class="action-area">
            <a href="${loginUrl}" class="btn">Log In to RRM Portal</a>
          </div>

          <div class="note">
            <strong>Security Tip:</strong> We recommend changing your password or using "Forgot Password" to choose a permanent secure password once logged in.
            If you did not request this account, please contact your company administrator.
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Welcome to RRM (Reliable Risk Management) - Your Login Credentials`,
    text: `Hello ${fullName},\n\nYour account has been created.\nLogin Email: ${to}\nTemporary Password: ${temporaryPassword || "(Click Forgot Password to set)"}\n\nLogin here: ${loginUrl}`,
    html: htmlContent,
  })
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) {
  const fromAddress = process.env.SMTP_FROM || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Password Reset Request - RRM (Reliable Risk Management)`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ff4e00;">Reset Your Password</h2>
        <p>You requested a password reset for your RRM account.</p>
        <p>Click the link below to set a new password:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #ff4e00; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </p>
        <p style="font-size: 12px; color: #888;">If you did not request this reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}
