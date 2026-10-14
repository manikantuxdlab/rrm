import type { ViteDevServer } from "vite"
import nodemailer from "nodemailer"

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
            const { type, to, fullName, temporaryPassword, role, companyName, status } = data

            if (!to) {
              res.statusCode = 400
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ error: "Recipient 'to' email is required" }))
              return
            }

            const loginUrl = "https://service-safety.pages.dev/login"
            const fromAddress = env.SMTP_FROM || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

            const isUpdate = type === "account_updated"
            const subject = isUpdate
              ? "Account Details Updated - RRM (Reliable Risk Management)"
              : "Welcome to RRM (Reliable Risk Management) - Your Login Credentials"

            const htmlContent = `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
                <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                  <div style="background: #0f172a; padding: 24px; text-align: center; border-bottom: 3px solid #ff4e00;">
                    <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">RRM • Reliable Risk Management</h1>
                  </div>
                  <div style="padding: 32px 28px;">
                    <h2 style="font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 12px; color: #0f172a;">Hello ${fullName || "User"},</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                      ${
                        isUpdate
                          ? "Your account details on the <strong>RRM (Reliable Risk Management) Portal</strong> have been updated by an administrator."
                          : `Your account has been created on the <strong>RRM (Reliable Risk Management) Portal</strong> for <strong>${companyName || "Organization"}</strong> with role <strong>${role || "Staff"}</strong>.`
                      }
                    </p>

                    <div style="background: #fff7ed; border: 1px solid #ffedd5; border-left: 4px solid #ff4e00; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                      <div style="margin-bottom: 10px; font-size: 14px;">
                        <strong style="color: #7c2d12; display: inline-block; width: 140px;">Account Email:</strong>
                        <span style="font-family: monospace; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #fed7aa; color: #9a3412; font-weight: 600;">${to}</span>
                      </div>
                      ${
                        role
                          ? `<div style="margin-bottom: 10px; font-size: 14px;">
                              <strong style="color: #7c2d12; display: inline-block; width: 140px;">Role / Access:</strong>
                              <span style="font-weight: 600; color: #1e293b;">${role}</span>
                            </div>`
                          : ""
                      }
                      ${
                        companyName
                          ? `<div style="margin-bottom: 10px; font-size: 14px;">
                              <strong style="color: #7c2d12; display: inline-block; width: 140px;">Company:</strong>
                              <span style="font-weight: 600; color: #1e293b;">${companyName}</span>
                            </div>`
                          : ""
                      }
                      ${
                        status
                          ? `<div style="margin-bottom: ${temporaryPassword ? "10px" : "0"}; font-size: 14px;">
                              <strong style="color: #7c2d12; display: inline-block; width: 140px;">Status:</strong>
                              <span style="font-weight: 600; text-transform: capitalize; color: ${status === "active" ? "#16a34a" : "#dc2626"};">${status}</span>
                            </div>`
                          : ""
                      }
                      ${
                        temporaryPassword
                          ? `<div style="font-size: 14px;">
                              <strong style="color: #7c2d12; display: inline-block; width: 140px;">Password:</strong>
                              <span style="font-family: monospace; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #fed7aa; color: #9a3412; font-weight: 600;">${temporaryPassword}</span>
                            </div>`
                          : ""
                      }
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${loginUrl}" style="display: inline-block; background-color: #ff4e00; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 6px; font-size: 14px;">Log In to RRM Portal</a>
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 24px;">
                      <strong>Security Note:</strong> If you did not recognize these changes, please contact your administrator or use "Forgot Password" to secure your account.
                    </p>
                  </div>
                </div>
              </div>
            `

            await transporter.sendMail({
              from: fromAddress,
              to,
              subject,
              html: htmlContent,
            })

            console.log(`[Email Service] ${isUpdate ? "Update" : "Welcome"} email sent successfully to ${to}`)

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
