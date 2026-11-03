import nodemailer from "nodemailer"

// Hosted official RRM corporate logo image (verified CDN on Supabase storage)
const RRM_LOGO_URL = "https://jnjswgavjahizagdtbii.supabase.co/storage/v1/object/public/worker-documents/assets/rrm-logo.png"

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

function buildAppleEmailTemplate({
  type = "welcome",
  to,
  fullName,
  temporaryPassword,
  role,
  companyName,
  resetUrl,
  loginUrl = "https://service-safety.pages.dev/login",
}: {
  type?: "welcome" | "forgot_password" | "reset_password" | "account_updated"
  to: string
  fullName?: string
  temporaryPassword?: string
  role?: string
  companyName?: string
  resetUrl?: string
  loginUrl?: string
}) {
  const isReset = type === "forgot_password" || type === "reset_password"
  const isUpdate = type === "account_updated"

  const actionUrl = isReset ? (resetUrl || loginUrl) : loginUrl
  const eyebrow = isReset ? "Security Verification" : (isUpdate ? "Account Update" : "Account Access Granted")
  const title = isReset ? "Reset Your Account Password" : (isUpdate ? "Account Profile Updated" : "Welcome to RRM Safety")
  const buttonText = isReset ? "Reset My Password" : "Log In to Portal"

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <style>
    body, table, td, p, a, span { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f5f5f7 !important;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "SF Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #1d1d1f;
      width: 100% !important;
      height: 100% !important;
    }
    table {
      border-spacing: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      margin: 0 auto !important;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 24px 12px 32px 12px !important;
      }
      .email-card {
        padding: 32px 20px !important;
        border-radius: 16px !important;
      }
      .email-title {
        font-size: 23px !important;
        letter-spacing: -0.02em !important;
      }
      .cred-row-label {
        display: block !important;
        width: 100% !important;
        padding-bottom: 3px !important;
      }
      .cred-row-val {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }
      .button-cta {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        text-align: center !important;
        padding: 14px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <div style="background-color: #f5f5f7; width: 100%; min-height: 100%;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f7;">
      <tr>
        <td align="center" class="email-wrapper" style="padding: 40px 16px 48px 16px;">

          <!-- Brand Logo Header -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin-bottom: 24px;">
            <tr>
              <td align="center">
                <a href="https://service-safety.pages.dev" target="_blank" style="text-decoration: none; display: inline-block;">
                  <img src="${RRM_LOGO_URL}" alt="Reliable Risk Management" width="124" style="display: block; width: 124px; max-width: 124px; height: auto; border: 0;" />
                </a>
                <div style="margin-top: 10px; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #86868b; text-transform: uppercase;">
                  Reliable Risk Management
                </div>
              </td>
            </tr>
          </table>

          <!-- Main White Card -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e5e5ea; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); overflow: hidden;">
            <tr>
              <td class="email-card" style="padding: 44px 40px;">
                
                <!-- Eyebrow Pill -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                  <tr>
                    <td style="background-color: #fff4ed; border: 1px solid #fed7aa; border-radius: 980px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #ea580c; text-transform: uppercase; letter-spacing: 0.06em;">
                      ${eyebrow}
                    </td>
                  </tr>
                </table>

                <!-- Main Headline -->
                <h1 class="email-title" style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.025em; line-height: 1.25;">
                  ${title}
                </h1>

                <!-- Salutation -->
                <p style="margin: 0 0 14px 0; font-size: 15px; font-weight: 600; color: #1d1d1f; line-height: 1.5;">
                  Hello ${fullName || "Valued Partner"},
                </p>

                <!-- Description Paragraph -->
                <p style="margin: 0 0 28px 0; font-size: 14.5px; line-height: 1.6; color: #515154;">
                  ${
                    isReset
                      ? "We received a request to reset your password for the <strong>RRM Field & Safety Platform</strong>. Click the button below to verify your identity and set a new password:"
                      : (isUpdate
                        ? "Your account details on the <strong>RRM Field & Safety Platform</strong> have been updated. You can use your credentials to sign in below:"
                        : `Your corporate field account has been provisioned on the <strong>RRM Platform</strong> for <strong>${companyName || "Your Organization"}</strong> with the assigned role of <strong>${role || "Field Foreman"}</strong>.`)
                  }
                </p>

                ${
                  !isReset
                    ? `
                <!-- Minimal Inset Credentials Card -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fbfbfd; border-radius: 14px; border: 1px solid #e8e8ed; margin-bottom: 28px;">
                  <tr>
                    <td style="padding: 20px 22px;">
                      <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #86868b; margin-bottom: 14px;">
                        Access Credentials
                      </div>

                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                        <!-- Email Row -->
                        <tr>
                          <td class="cred-row-label" width="38%" style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #86868b;">
                            Sign-In Email
                          </td>
                          <td class="cred-row-val" style="padding: 8px 0; font-size: 13.5px; font-weight: 600; color: #1d1d1f; font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace;">
                            ${to}
                          </td>
                        </tr>

                        ${
                          temporaryPassword
                            ? `
                        <!-- Divider -->
                        <tr>
                          <td colspan="2" style="border-top: 1px solid #f0f0f2; height: 1px; padding: 0;"></td>
                        </tr>
                        <!-- Password Row -->
                        <tr>
                          <td class="cred-row-label" width="38%" style="padding: 10px 0; font-size: 13px; font-weight: 500; color: #86868b;">
                            Temporary Password
                          </td>
                          <td class="cred-row-val" style="padding: 10px 0;">
                            <span style="display: inline-block; font-family: ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, monospace; background-color: #ffffff; border: 1px solid #d2d2d7; padding: 5px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; color: #ff4e00; letter-spacing: 0.04em;">
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
                        <!-- Divider -->
                        <tr>
                          <td colspan="2" style="border-top: 1px solid #f0f0f2; height: 1px; padding: 0;"></td>
                        </tr>
                        <!-- Role Row -->
                        <tr>
                          <td class="cred-row-label" width="38%" style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #86868b;">
                            Assigned Role
                          </td>
                          <td class="cred-row-val" style="padding: 8px 0; font-size: 13.5px; font-weight: 600; color: #1d1d1f; text-transform: capitalize;">
                            ${role}
                          </td>
                        </tr>
                        `
                            : ""
                        }

                        ${
                          companyName
                            ? `
                        <!-- Divider -->
                        <tr>
                          <td colspan="2" style="border-top: 1px solid #f0f0f2; height: 1px; padding: 0;"></td>
                        </tr>
                        <!-- Company Row -->
                        <tr>
                          <td class="cred-row-label" width="38%" style="padding: 8px 0; font-size: 13px; font-weight: 500; color: #86868b;">
                            Organization
                          </td>
                          <td class="cred-row-val" style="padding: 8px 0; font-size: 13.5px; font-weight: 600; color: #1d1d1f;">
                            ${companyName}
                          </td>
                        </tr>
                        `
                            : ""
                        }
                      </table>
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }

                <!-- Primary CTA Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0 24px 0;">
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${actionUrl}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="#ff4e00" stroke="f">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">${buttonText}</center>
                      </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-->
                      <a href="${actionUrl}" target="_blank" class="button-cta" style="display: inline-block; background-color: #ff4e00; color: #ffffff !important; text-decoration: none; font-size: 14.5px; font-weight: 600; padding: 13px 38px; border-radius: 980px; letter-spacing: -0.01em; box-shadow: 0 4px 14px rgba(255, 78, 0, 0.28); text-align: center;">
                        ${buttonText}
                      </a>
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <!-- Security Guidance Inset -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f7; border-radius: 12px; margin-top: 10px;">
                  <tr>
                    <td style="padding: 14px 18px;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #1d1d1f;">
                        🔒 Security Recommendation
                      </p>
                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #6e6e73;">
                        ${
                          isReset
                            ? "This link is single-use and will expire shortly. If you did not make this request, your account is still secure and you can disregard this email."
                            : "For account security, please update your temporary password after your initial sign-in using the <strong>Forgot Password</strong> link on the login screen."
                        }
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Fallback Direct URL -->
                <div style="margin-top: 24px; font-size: 11.5px; color: #86868b; line-height: 1.5; text-align: center;">
                  Button not working? Paste this link into your browser:<br />
                  <a href="${actionUrl}" target="_blank" style="color: #ff4e00; text-decoration: underline; word-break: break-all;">
                    ${actionUrl}
                  </a>
                </div>

              </td>
            </tr>
          </table>

          <!-- Apple Minimalist Footer -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin-top: 28px;">
            <tr>
              <td align="center" style="padding: 0 16px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #515154; letter-spacing: 0.02em;">
                  Reliable Risk Management (RRM)
                </p>
                <p style="margin: 0 0 12px 0; font-size: 11px; color: #86868b; line-height: 1.5;">
                  Enterprise Safety Compliance, Automated OSHA Logs & Jobsite Hazard Mitigation
                </p>
                <p style="margin: 0 0 14px 0; font-size: 11px; color: #86868b; line-height: 1.5;">
                  <a href="https://service-safety.pages.dev/login" target="_blank" style="color: #86868b; text-decoration: none; margin: 0 8px;">Portal Login</a> •
                  <a href="https://service-safety.pages.dev" target="_blank" style="color: #86868b; text-decoration: none; margin: 0 8px;">Safety Network</a> •
                  <a href="mailto:support@reliableriskmgmt.com" style="color: #86868b; text-decoration: none; margin: 0 8px;">Support</a>
                </p>
                <p style="margin: 0; font-size: 10.5px; color: #a1a1a6; line-height: 1.5;">
                  © ${new Date().getFullYear()} Reliable Risk Management LLC. All rights reserved.<br />
                  This is an automated platform notification. Please do not reply directly to this email.
                </p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}

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
  const loginUrl = appUrl || "https://service-safety.pages.dev/login"
  const fromAddress = process.env.SMTP_FROM || "RRM - Reliable Risk Management <guptaronak243@gmail.com>"

  const htmlContent = buildAppleEmailTemplate({
    type: "welcome",
    to,
    fullName,
    temporaryPassword,
    role,
    companyName,
    loginUrl,
  })

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Welcome to RRM Safety • Your Access Credentials`,
    text: `Hello ${fullName},\n\nYour RRM account has been created.\nLogin Email: ${to}\nTemporary Password: ${temporaryPassword || "(Click Forgot Password to set)"}\n\nLogin here: ${loginUrl}`,
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

  const htmlContent = buildAppleEmailTemplate({
    type: "reset_password",
    to,
    resetUrl,
  })

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject: `Password Reset Request • RRM Safety Portal`,
    text: `You requested a password reset for your RRM account.\nReset link: ${resetUrl}`,
    html: htmlContent,
  })
}
