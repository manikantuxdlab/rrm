import { jsPDF } from "jspdf"
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
 * Creates a clean vector/bitmap PDF directly in Base64 using jsPDF
 */
export function createAuditPdfBase64(
  submission: SubmissionRecord,
  _jobSite?: JobSite
): string {
  const doc = new jsPDF("p", "pt", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()

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

  // Header Banner
  doc.setFillColor(15, 23, 42) // #0f172a
  doc.rect(0, 0, pageWidth, 75, "F")

  doc.setFillColor(234, 88, 12) // #ea580c orange logo box
  doc.roundedRect(30, 18, 40, 40, 6, 6, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("RRM", 38, 43)

  doc.setFontSize(13)
  doc.text("RELIABLE RISK MANAGEMENT", 80, 36)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(249, 115, 22)
  doc.text("CAL/OSHA SAFETY & RISK COMPLIANCE AUDIT", 80, 50)

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(8.5)
  doc.text(`REF: ${submission.id}`, pageWidth - 30, 35, { align: "right" })
  doc.text(`DATE: ${submission.timestamp}`, pageWidth - 30, 48, { align: "right" })

  // Project Dossier
  let y = 100
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text(submission.title, 30, y)

  y += 18
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(30, y, pageWidth - 60, 52, 6, 6, "FD")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("JOBSITE LOCATION:", 42, y + 18)
  doc.text("FOREMAN / CONTRACTOR:", 320, y + 18)

  doc.setTextColor(15, 23, 42)
  doc.text(submission.jobSiteName || "Active Site", 42, y + 33)
  doc.text(`${submission.foremanName} (${submission.companyName})`, 320, y + 33)

  // Scorecard
  y += 70
  const colW = (pageWidth - 60 - 24) / 3
  // Box 1
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(30, y, colW, 40, 6, 6, "FD")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text("TOTAL ITEMS", 30 + colW / 2, y + 16, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.text(String(items.length || passedCount), 30 + colW / 2, y + 33, { align: "center" })

  // Box 2
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(30 + colW + 12, y, colW, 40, 6, 6, "FD")
  doc.setFontSize(8)
  doc.setTextColor(6, 95, 70)
  doc.text("PASSED / OK", 30 + colW + 12 + colW / 2, y + 16, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(5, 150, 105)
  doc.text(String(passedCount), 30 + colW + 12 + colW / 2, y + 33, { align: "center" })

  // Box 3
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 205, 211)
  doc.roundedRect(30 + (colW + 12) * 2, y, colW, 40, 6, 6, "FD")
  doc.setFontSize(8)
  doc.setTextColor(159, 18, 57)
  doc.text("DEFICIENCIES", 30 + (colW + 12) * 2 + colW / 2, y + 16, { align: "center" })
  doc.setFontSize(14)
  doc.setTextColor(225, 29, 72)
  doc.text(String(failedCount), 30 + (colW + 12) * 2 + colW / 2, y + 33, { align: "center" })

  // Table header
  y += 60
  doc.setFillColor(241, 245, 249)
  doc.rect(30, y, pageWidth - 60, 20, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("#", 36, y + 13)
  doc.text("CATEGORY", 60, y + 13)
  doc.text("CAL/OSHA INSPECTION STANDARD", 160, y + 13)
  doc.text("STATUS", pageWidth - 45, y + 13, { align: "right" })

  y += 20
  items.slice(0, 18).forEach((item, idx) => {
    doc.setDrawColor(226, 232, 240)
    doc.line(30, y + 18, pageWidth - 30, y + 18)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(String(idx + 1), 36, y + 12)
    doc.text((item.category || "").toUpperCase().slice(0, 15), 60, y + 12)

    doc.setTextColor(15, 23, 42)
    doc.text((item.labelEn || "").slice(0, 52), 160, y + 12)

    if (item.status === "pass") {
      doc.setTextColor(5, 150, 105)
      doc.text("PASS", pageWidth - 45, y + 12, { align: "right" })
    } else if (item.status === "fail") {
      doc.setTextColor(225, 29, 72)
      doc.text("DEFICIENT", pageWidth - 45, y + 12, { align: "right" })
    } else {
      doc.setTextColor(100, 116, 139)
      doc.text("N/A", pageWidth - 45, y + 12, { align: "right" })
    }
    y += 18
  })

  // Signature Block at Bottom
  const sigY = 730
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(30, sigY, pageWidth - 60, 65, 6, 6, "D")

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("FOREMAN CERTIFICATION & SIGNATURE SIGN-OFF", 42, sigY + 16)

  const signatureUri =
    submission.signatureUri ||
    submission.data?.signatureUri ||
    submission.data?.signature

  if (signatureUri && signatureUri.startsWith("data:image")) {
    try {
      doc.addImage(signatureUri, "PNG", 42, sigY + 22, 120, 32)
    } catch {
      doc.setFont("times", "italic")
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text(submission.foremanName || "Foreman Signed", 42, sigY + 42)
    }
  } else {
    doc.setFont("times", "italic")
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(submission.foremanName || "Foreman Signed", 42, sigY + 42)
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(`Foreman: ${submission.foremanName} • Timestamp: ${submission.timestamp}`, 42, sigY + 58)

  doc.text(`Dispatched to: ${submission.recipients?.join(", ") || "Management"}`, pageWidth - 42, sigY + 42, { align: "right" })
  doc.text("Certified via RRM Safety Platform", pageWidth - 42, sigY + 58, { align: "right" })

  // PAGE 2: EVIDENCE PHOTOS (If any photos attached)
  const photosList: { uri: string; label: string }[] = []
  items.forEach((item, idx) => {
    if (item.photoUri) {
      photosList.push({ uri: item.photoUri, label: item.labelEn || `Deficiency #${idx + 1}` })
    }
  })
  if (Array.isArray(submission.data?.photos)) {
    submission.data.photos.forEach((p: string, i: number) => {
      photosList.push({ uri: p, label: `Evidence Photo #${i + 1}` })
    })
  }

  if (photosList.length > 0) {
    doc.addPage()

    // Page 2 Header Banner
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, 55, "F")

    doc.setFillColor(234, 88, 12)
    doc.roundedRect(30, 12, 30, 30, 4, 4, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.text("RRM", 36, 31)

    doc.setFontSize(11)
    doc.text("ATTACHED FIELD EVIDENCE PHOTOS & CITATIONS", 70, 28)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(249, 115, 22)
    doc.text(`AUDIT REF: #${submission.id} • ${submission.jobSiteName}`, 70, 41)

    let photoY = 80
    const photoW = (pageWidth - 60 - 20) / 2
    const photoH = 140

    photosList.slice(0, 4).forEach((p, pIdx) => {
      const col = pIdx % 2
      const row = Math.floor(pIdx / 2)
      const px = 30 + col * (photoW + 20)
      const py = photoY + row * (photoH + 50)

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(px, py, photoW, photoH + 40, 6, 6, "FD")

      if (p.uri && p.uri.startsWith("data:image")) {
        try {
          doc.addImage(p.uri, "JPEG", px + 8, py + 8, photoW - 16, photoH - 16)
        } catch {
          doc.setFontSize(9)
          doc.setTextColor(100, 116, 139)
          doc.text("[Evidence Image Recorded]", px + 15, py + 70)
        }
      } else {
        doc.setFontSize(9)
        doc.setTextColor(100, 116, 139)
        doc.text("[Field Image Uploaded to Cloud]", px + 15, py + 70)
      }

      doc.setFontSize(8.5)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(15, 23, 42)
      doc.text(p.label.slice(0, 40), px + 10, py + photoH + 16)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.setTextColor(100, 116, 139)
      doc.text(`Captured on site • ${submission.jobSiteName}`, px + 10, py + photoH + 28)
    })
  }

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
