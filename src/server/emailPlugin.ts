import type { ViteDevServer } from "vite"
import nodemailer from "nodemailer"

// Hosted official RRM corporate logo image (verified CDN on Supabase storage)

export function emailApiPlugin(env: Record<string, string>) {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: Number(env.SMTP_PORT) || 465,
    secure: env.SMTP_SECURE === "true" || true,
    auth: {
      user: env.SMTP_USER || env.GMAIL_USER || "guptaronak243@gmail.com",
      pass: env.SMTP_PASS || env.GMAIL_PASS || "kmqslavutznjeerq",
    },
  })

  return {
    name: "vite-plugin-email-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/send-email", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify({ error: "Method Not Allowed" }))
          return
        }

        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })

        req.on("end", async () => {
          try {
            const data = JSON.parse(body || "{}")
            const { type, to, cc, subject: customSubject, fullName, temporaryPassword, role,  resetUrl, html: customHtml, attachments } = data

            if (!to) {
              res.statusCode = 400
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ error: "Recipient 'to' email is required" }))
              return
            }

            const loginUrl = "https://service-safety.pages.dev/login"
            const fromAddress = env.SMTP_FROM || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

            const isReset = type === "forgot_password" || type === "reset_password"
            const isUpdate = type === "account_updated"

            const subject = customSubject || (isReset
              ? "Password Reset Request • RRM Safety Portal"
              : isUpdate
                ? "Account Updated • RRM Safety Portal"
                : "Welcome to RRM Safety • Your Access Credentials")

            const actionUrl = isReset ? (resetUrl || loginUrl) : loginUrl
                        const title = isReset ? "Reset Your Account Password" : (isUpdate ? "Account Profile Updated" : "Welcome to RRM Safety")
            const buttonText = isReset ? "Reset My Password" : "Log In to Portal"

            const defaultHtmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Google Sans', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; text-align: left;">
          
          <!-- Google Minimal Logo / Header -->
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #dadce0;">
              <span style="font-size: 20px; font-weight: 700; color: #202124; letter-spacing: -0.3px;">RRM</span>
              <span style="font-size: 14px; font-weight: 400; color: #5f6368; margin-left: 6px;">Safety Platform</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding-top: 32px; padding-bottom: 24px;">
              <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 400; color: #202124; line-height: 1.3;">
                ${title}
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #3c4043;">
                Hi ${fullName || "there"},
              </p>

              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #3c4043;">
                ${
                  isReset
                    ? "We received a request to reset your password. Click below to verify your account and set a new password."
                    : (isUpdate
                      ? "Your account details on RRM Safety have been updated. You can sign in below:"
                      : "An account has been created for you on the <strong>RRM Global Safety</strong> platform. You can now access your daily safety talks, checklists, and inspections.")
                }
              </p>

              ${
                !isReset && temporaryPassword
                  ? `
              <!-- Google-Style Inset Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border: 1px solid #dadce0; border-radius: 8px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #5f6368; margin-bottom: 12px;">
                      Sign-In Details
                    </div>

                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                      <tr>
                        <td width="36%" style="padding: 6px 0; color: #5f6368; font-weight: 400;">Email</td>
                        <td style="padding: 6px 0; color: #202124; font-weight: 500;">${to}</td>
                      </tr>
                      <tr>
                        <td width="36%" style="padding: 6px 0; color: #5f6368; font-weight: 400;">Temporary password</td>
                        <td style="padding: 6px 0;">
                          <span style="font-family: Roboto Mono, Menlo, Monaco, Consolas, monospace; background-color: #ffffff; border: 1px solid #dadce0; padding: 3px 8px; border-radius: 4px; font-size: 13px; font-weight: 600; color: #1a73e8; letter-spacing: 0.5px;">
                            ${temporaryPassword}
                          </span>
                        </td>
                      </tr>
                      ${role ? `
                      <tr>
                        <td width="36%" style="padding: 6px 0; color: #5f6368; font-weight: 400;">Role</td>
                        <td style="padding: 6px 0; color: #202124; font-weight: 500; text-transform: capitalize;">${role}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''
              }

              <!-- Google Primary Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; background-color: #1a73e8; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 10px 24px; border-radius: 4px; text-align: center;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.5; color: #5f6368;">
                ${
                  isReset
                    ? "If you did not request a password reset, you can safely ignore this email."
                    : "For your security, you'll be asked to create a permanent password after signing in for the first time."
                }
              </p>
            </td>
          </tr>

          <!-- Google Minimalist Footer -->
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid #dadce0; font-size: 12px; line-height: 1.6; color: #70757a;">
              <p style="margin: 0 0 6px 0;">
                This email was sent to <span style="color: #202124;">${to}</span> regarding your RRM Global Safety account.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9aa0a6;">
                Reliable Risk Management · Safety & Field Operations Compliance · © ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

            const htmlToSend = customHtml || defaultHtmlBody

            const recipients = Array.isArray(to) ? to.join(", ") : to
            const ccRecipients = cc ? (Array.isArray(cc) ? cc.join(", ") : cc) : undefined

            await transporter.sendMail({
              from: fromAddress,
              to: recipients,
              cc: ccRecipients,
              subject,
              html: htmlToSend,
              attachments: Array.isArray(attachments) ? attachments : undefined,
            })

            console.log(`[Email Service] ${isReset ? "Reset" : isUpdate ? "Update" : "Welcome"} email sent to ${to}`)

            res.statusCode = 200
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ success: true, message: `Email sent to ${to}` }))
          } catch (err: unknown) {
            console.error("[Email Service] Failed to send email:", err)
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.end(
              JSON.stringify({
                success: false,
                error: err instanceof Error ? err.message : "Failed to send email",
              })
            )
          }
        })
      })
    },
  }
}
