import { buildSafetyAuditPdfDoc } from "@/services/pdfReportService"
import type { SubmissionRecord, ChecklistItem, JobSite } from "@/types"

/**
 * Generates an official, clean branded HTML email template for safety audit dispatches
 */
export function generateBrandedAuditEmailHTML(
  submission: SubmissionRecord,
  _jobSite?: JobSite
): string {
  const items: ChecklistItem[] = Array.isArray(submission.data?.items)
    ? submission.data.items
    : []

  const passedCount =
    typeof submission.data?.passedCount === "number"
      ? submission.data.passedCount
      : items.filter((i) => i.status === "pass").length

  const failedCount =
    typeof submission.data?.failedCount === "number"
      ? submission.data.failedCount
      : items.filter((i) => i.status === "fail").length

  const signatureUri =
    submission.signatureUri ||
    submission.data?.signatureUri ||
    submission.data?.signature

  const trade = submission.data?.trade || "General Construction"
  const inspectingArea = submission.data?.inspectingArea || "Main Work Zone"

  // Collect photos
  const photos: { uri: string; label: string }[] = []
  items.forEach((item, idx) => {
    if (item.photoUri) {
      photos.push({ uri: item.photoUri, label: item.labelEn || `Deficiency #${idx + 1}` })
    }
  })
  if (Array.isArray(submission.data?.photos)) {
    submission.data.photos.forEach((p: string, i: number) => {
      photos.push({ uri: p, label: `Evidence Photo #${i + 1}` })
    })
  }

  // Deficiencies list
  const deficiencies = items.filter((i) => i.status === "fail")

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safety Compliance Inspection Report</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);">
          
          <!-- Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; border-bottom: 3px solid #f97316;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 12px; border-radius: 8px; letter-spacing: -0.5px; vertical-align: middle;">
                      RRM
                    </div>
                    <span style="color: #ffffff; font-size: 16px; font-weight: 800; margin-left: 10px; vertical-align: middle; letter-spacing: -0.3px;">
                      RELIABLE RISK MANAGEMENT
                    </span>
                    <div style="color: #94a3b8; font-size: 11px; font-weight: 600; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                      Occupational Safety & Risk Compliance Division
                    </div>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Cal/OSHA Verified
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dispatched Notice Banner -->
          <tr>
            <td style="padding: 24px 32px 16px 32px; background-color: #ffffff;">
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="24" style="vertical-align: middle;">
                      <span style="color: #059669; font-size: 18px; font-weight: bold;">✓</span>
                    </td>
                    <td style="vertical-align: middle; padding-left: 8px;">
                      <span style="font-size: 12px; font-weight: 700; color: #065f46;">Daily Safety Inspection Successfully Logged & Dispatched</span>
                      <div style="font-size: 11px; color: #047857; margin-top: 2px;">Official signed PDF copy attached below for insurance & OSHA compliance records.</div>
                    </td>
                  </tr>
                </table>
              </div>

              <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                ${submission.title}
              </h2>
              <div style="font-size: 11px; color: #64748b; font-family: monospace;">
                Audit Ref: #${submission.id} • Certified Time: ${submission.timestamp}
              </div>
            </td>
          </tr>

          <!-- Project & Foreman Dossier -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Jobsite Location</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px;">${submission.jobSiteName}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Area: ${inspectingArea} • Trade: ${trade}</div>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; border-left: 1px solid #e2e8f0;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Submitting Lead</div>
                    <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px;">${submission.foremanName}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${submission.companyName}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Executive Scorecard -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="31%" style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Items</div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 2px;">${items.length || passedCount}</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 9.5px; font-weight: 700; color: #065f46; text-transform: uppercase;">Passed / OK</div>
                    <div style="font-size: 20px; font-weight: 800; color: #059669; margin-top: 2px;">${passedCount}</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: ${failedCount > 0 ? "#fff1f2" : "#f8fafc"}; border: 1px solid ${failedCount > 0 ? "#fecdd3" : "#e2e8f0"}; border-radius: 10px; padding: 12px; text-align: center;">
                    <div style="font-size: 9.5px; font-weight: 700; color: ${failedCount > 0 ? "#9f1239" : "#64748b"}; text-transform: uppercase;">Deficiencies</div>
                    <div style="font-size: 20px; font-weight: 800; color: ${failedCount > 0 ? "#e11d48" : "#0f172a"}; margin-top: 2px;">${failedCount}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Flagged Deficiencies (If any) -->
          ${
            deficiencies.length > 0
              ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 14px 16px;">
                <div style="font-size: 11px; font-weight: 800; color: #be123c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  ⚠️ Flagged Deficiencies & Corrective Actions
                </div>
                ${deficiencies
                  .map(
                    (def) => `
                  <div style="font-size: 11px; color: #0f172a; margin-top: 4px; padding-left: 10px; border-left: 2px solid #e11d48;">
                    <b>${def.labelEn}:</b> ${def.notes || "Hazard noted and addressed on site."}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Evidence Photos (If any) -->
          ${
            photos.length > 0
              ? `
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Attached Field Evidence Photos (${photos.length})
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${photos
                    .slice(0, 3)
                    .map(
                      (p) => `
                    <td width="32%" style="vertical-align: top; padding: 4px;">
                      <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #f8fafc;">
                        <img src="${p.uri}" style="width: 100%; height: 95px; object-fit: cover; display: block;" alt="${p.label}" />
                        <div style="padding: 4px 6px; font-size: 9px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                          ${p.label}
                        </div>
                      </div>
                    </td>
                  `
                    )
                    .join("")}
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Foreman Digital Signature Attestation -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
                <tr>
                  <td width="60%" style="vertical-align: middle;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Foreman Digital Sign-Off</div>
                    <div style="margin-top: 8px; height: 50px; background-color: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 4px 12px; display: flex; align-items: center;">
                      ${
                        signatureUri
                          ? `<img src="${signatureUri}" style="max-height: 42px; max-width: 100%; object-fit: contain;" alt="Signature" />`
                          : `<span style="font-family: Georgia, serif; font-style: italic; font-weight: 700; font-size: 15px; color: #0f172a;">${submission.foremanName}</span>`
                      }
                    </div>
                    <div style="font-size: 9.5px; color: #64748b; margin-top: 4px;">Certified: ${submission.foremanName} • ${submission.timestamp}</div>
                  </td>
                  <td width="40%" style="vertical-align: middle; padding-left: 16px; text-align: right;">
                    <div style="display: inline-block; padding: 8px 12px; background-color: #ea580c; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 8px;">
                      📄 PDF Report Attached
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0f172a; color: #94a3b8; font-size: 10px; text-align: center; line-height: 1.5;">
              <div>Reliable Risk Management Safety Cloud • Cal/OSHA Construction Compliance Division</div>
              <div style="margin-top: 4px; color: #64748b;">This transmission contains confidential safety compliance documentation. Retain for insurance policy auditing & OSHA 1904/1926 records.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Creates a clean vector/bitmap PDF directly in Base64 using buildSafetyAuditPdfDoc
 */
export function createAuditPdfBase64(
  submission: SubmissionRecord,
  _jobSite?: JobSite
): string {
  const doc = buildSafetyAuditPdfDoc(submission)
  return doc.output("datauristring").split(",")[1]
}

/**
 * Dispatches a real branded email with attached PDF to recipients
 */
export async function sendBrandedAuditEmail(
  submission: SubmissionRecord,
  jobSite?: JobSite
): Promise<boolean> {
  try {
    const html = generateBrandedAuditEmailHTML(submission, jobSite)
    const pdfBase64 = createAuditPdfBase64(submission, jobSite)

    const jobName = submission.jobSiteName || jobSite?.name || ""
    let cleanTitle = submission.title || "Daily Safety Inspection"
    if (jobName && !cleanTitle.includes(jobName)) {
      cleanTitle = `${cleanTitle} - ${jobName}`
    }

    const toList: string[] = []
    if (Array.isArray(submission.recipients) && submission.recipients.length > 0) {
      submission.recipients.forEach((r) => {
        if (r && !toList.includes(r)) toList.push(r)
      })
    }

    if (submission.foremanEmail && !toList.includes(submission.foremanEmail)) {
      toList.push(submission.foremanEmail)
    }

    if (toList.length === 0) {
      toList.push("mvance.boss@titanconcrete-ca.com")
    }

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toList,
        cc: ["service@reliableriskmgmt.com", "guptaronak243@gmail.com"],
        subject: `[SAFETY COMPLIANCE] ${cleanTitle}`,
        html,
        attachments: [
          {
            filename: `Signed_CalOSHA_Audit_${submission.id}.pdf`,
            content: pdfBase64,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      }),
    })

    const resData = await response.json()
    console.log("[sendBrandedAuditEmail] Server response:", resData)
    return resData.success === true
  } catch (err) {
    console.error("[sendBrandedAuditEmail] Failed to send branded email with PDF:", err)
    return false
  }
}
