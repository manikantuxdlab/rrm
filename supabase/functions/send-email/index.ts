import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import nodemailer from "npm:nodemailer@6.9.13"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Hosted RRM official logo image
const RRM_LOGO_URL = "https://service-safety.pages.dev/logo.png"

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { type, to, fullName, temporaryPassword, role, companyName, resetUrl } = await req.json()

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Recipient 'to' email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const loginUrl = "https://service-safety.pages.dev/login"

    // Gmail SMTP credentials
    const SMTP_HOST = Deno.env.get("SMTP_HOSTNAME") || "smtp.gmail.com"
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT")) || 465
    const SMTP_USER = Deno.env.get("SMTP_USER") || "guptaronak243@gmail.com"
    const SMTP_PASS = Deno.env.get("SMTP_PASS") || "kmqslavutznjeerq"
    const FROM_EMAIL = Deno.env.get("SMTP_FROM") || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })

    const isReset = type === "forgot_password" || type === "reset_password"

    const subject = isReset
      ? "Password Reset Request • RRM Safety Portal"
      : "Welcome to RRM • Your Official Login Credentials"

    // High quality, enterprise corporate email template
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header with Logo -->
                <tr>
                  <td align="center" style="background-color: #0f172a; padding: 28px 20px; border-bottom: 4px solid #ff4e00;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <img src="${RRM_LOGO_URL}" alt="RRM - Reliable Risk Management" width="140" style="display: block; max-width: 140px; height: auto; margin-bottom: 8px; border: 0;" />
                          <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #ff8a4c; text-transform: uppercase;">
                            RELIABLE RISK MANAGEMENT
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 32px 28px 32px;">
                    <div style="display: inline-block; padding: 4px 12px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 20px; font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                      ${isReset ? "Security Verification" : "Account Access Granted"}
                    </div>

                    <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.3;">
                      ${isReset ? "Reset Your Account Password" : "Welcome to the RRM Safety Network"}
                    </h1>

                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Hello <strong>${fullName || "Valued Partner"}</strong>,
                    </p>

                    <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      ${
                        isReset
                          ? "We received a request to reset the password associated with your account on the <strong>RRM Field & Safety Compliance Platform</strong>. You can establish your new credentials using the button below:"
                          : `Your corporate field account has been provisioned on the <strong>RRM Platform</strong> for <strong>${companyName || "Your Contractor Organization"}</strong> with the assigned role of <strong>${role || "Field Foreman"}</strong>.`
                      }
                    </p>

                    ${
                      !isReset
                        ? `
                        <!-- Credentials Card -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #ff4e00; border-radius: 10px; padding: 20px 22px; margin-bottom: 28px;">
                          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 14px;">
                            Your Secure Login Information
                          </div>

                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="38%" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">
                                Login Email:
                              </td>
                              <td style="padding: 6px 0; font-size: 13px;">
                                <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; background-color: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700;">
                                  ${to}
                                </span>
                              </td>
                            </tr>
                            ${
                              temporaryPassword
                                ? `
                              <tr>
                                <td width="38%" style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #334155;">
                                  Temporary Password:
                                </td>
                                <td style="padding: 8px 0; font-size: 13px;">
                                  <span style="font-family: 'SF Mono', Consolas, Monaco, monospace; background-color: #fff7ed; padding: 4px 10px; border-radius: 6px; border: 1px solid #fed7aa; color: #c2410c; font-weight: 800;">
                                    ${temporaryPassword}
                                  </span>
                                </td>
                              </tr>
                            `
                                : ""
                            }
                            ${
                              role
                                ? `
                              <tr>
                                <td width="38%" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">
                                  Authorized Role:
                                </td>
                                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                                  ${role}
                                </td>
                              </tr>
                            `
                                : ""
                            }
                            ${
                              companyName
                                ? `
                              <tr>
                                <td width="38%" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #334155;">
                                  Organization:
                                </td>
                                <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #0f172a;">
                                  ${companyName}
                                </td>
                              </tr>
                            `
                                : ""
                            }
                          </table>
                        </div>
                        `
                        : ""
                    }

                    <!-- Primary Action Button -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                      <tr>
                        <td align="center">
                          <a href="${isReset ? (resetUrl || loginUrl) : loginUrl}" target="_blank" style="display: inline-block; background-color: #ff4e00; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(255, 78, 0, 0.35); text-align: center; letter-spacing: 0.3px;">
                            ${isReset ? "Reset My Password" : "Log In to RRM Portal"}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Security & Direct Link Advice -->
                    <div style="background-color: #f8fafc; border-radius: 10px; padding: 16px; margin-top: 24px; border: 1px solid #f1f5f9;">
                      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #334155;">
                        🔐 Important Security Guidance:
                      </p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                        ${
                          isReset
                            ? "This reset link is time-sensitive. If you did not initiate this request, you can safely disregard this notification; your current password will remain unchanged."
                            : "For security compliance, we strongly advise updating your password immediately after your first sign-in using the <strong>Forgot Password</strong> option on the login screen."
                        }
                      </p>
                    </div>

                    <!-- Plain URL Fallback -->
                    <div style="margin-top: 20px; font-size: 11px; color: #94a3b8; word-break: break-all; line-height: 1.4;">
                      Button not working? Copy and paste this URL into your browser:<br />
                      <a href="${isReset ? (resetUrl || loginUrl) : loginUrl}" style="color: #ff4e00; text-decoration: underline;">
                        ${isReset ? (resetUrl || loginUrl) : loginUrl}
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Corporate Footer -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px 30px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #e2e8f0; letter-spacing: 0.5px;">
                      RELIABLE RISK MANAGEMENT (RRM)
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                      Enterprise Safety Compliance, Automated OSHA Logs & Jobsite Hazard Mitigation
                    </p>
                    <p style="margin: 0; font-size: 10px; color: #64748b;">
                      © ${new Date().getFullYear()} Reliable Risk Management LLC. All rights reserved.<br />
                      This is an automated system transmission. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html: htmlBody,
    })

    return new Response(
      JSON.stringify({ success: true, message: `Email sent to ${to}`, messageId: info.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
