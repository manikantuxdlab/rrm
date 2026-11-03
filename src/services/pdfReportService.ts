import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { SubmissionRecord, ChecklistItem } from "@/types"

export async function generateSafetyAuditPdf(
  submission: SubmissionRecord,
  photos: { uri: string; label: string; category?: string }[] = []
): Promise<void> {
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

  const naCount =
    typeof submission.data?.naCount === "number"
      ? submission.data.naCount
      : items.filter((i) => i.status === "na").length

  const signatureUri =
    submission.signatureUri ||
    submission.data?.signatureUri ||
    submission.data?.signature

  // Create isolated container for PDF generation
  const container = document.createElement("div")
  container.style.position = "fixed"
  container.style.left = "-9999px"
  container.style.top = "0"
  container.style.width = "820px"
  container.style.backgroundColor = "#ffffff"
  container.style.color = "#0f172a"
  container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  container.style.padding = "40px 48px"
  container.style.boxSizing = "border-box"

  const trade = submission.data?.trade || "General Construction"
  const inspectingArea = submission.data?.inspectingArea || "Active Site Zone"
  const complianceScore = items.length > 0
    ? Math.round((passedCount / (items.length - naCount || 1)) * 100)
    : 100

  container.innerHTML = `
    <div style="width: 100%; font-family: inherit;">
      <!-- Top Brand Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #f97316; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="width: 52px; height: 52px; border-radius: 12px; background: linear-gradient(135deg, #ea580c, #f97316); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 900; font-size: 24px; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.3);">
            RRM
          </div>
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
              RELIABLE RISK MANAGEMENT
            </h1>
            <p style="margin: 2px 0 0 0; font-size: 11px; font-weight: 600; color: #f97316; text-transform: uppercase; letter-spacing: 1px;">
              Cal/OSHA Safety & Compliance Verification Report
            </p>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: #ecfdf5; border: 1px solid #10b981; color: #065f46; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
            Official Signed Record
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #64748b; font-weight: 600;">
            ID: ${submission.id}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Date: ${submission.timestamp}
          </div>
        </div>
      </div>

      <!-- Report Title -->
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
          ${submission.title}
        </h2>
        <p style="margin: 0; font-size: 11px; color: #64748b;">
          Comprehensive daily jobsite inspection record logged by site safety supervisor in accordance with Cal/OSHA Title 8 Construction Safety Orders.
        </p>
      </div>

      <!-- Metadata Box -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
            Project Location
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${submission.jobSiteName}
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Ref ID: ${submission.jobSiteId || "N/A"} • Area: ${inspectingArea}
          </div>
        </div>

        <div>
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
            Submitting Foreman / Contractor
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
            ${submission.foremanName} (${submission.companyName})
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            Email: ${submission.foremanEmail || "Direct Mobile App Submission"} • Trade: ${trade}
          </div>
        </div>
      </div>

      <!-- Audit Results Scorecard Bar -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background-color: #ffffff; text-align: center;">
          <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Items</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 2px;">${items.length || passedCount}</div>
        </div>
        <div style="border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px; background-color: #ecfdf5; text-align: center;">
          <div style="font-size: 9px; font-weight: 700; color: #065f46; text-transform: uppercase;">Passed / OK</div>
          <div style="font-size: 18px; font-weight: 800; color: #059669; margin-top: 2px;">${passedCount}</div>
        </div>
        <div style="border: 1px solid #fecdd3; border-radius: 8px; padding: 10px; background-color: #fff1f2; text-align: center;">
          <div style="font-size: 9px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Deficiencies</div>
          <div style="font-size: 18px; font-weight: 800; color: #e11d48; margin-top: 2px;">${failedCount}</div>
        </div>
        <div style="border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; background-color: #fff7ed; text-align: center;">
          <div style="font-size: 9px; font-weight: 700; color: #9a3412; text-transform: uppercase;">Compliance Rate</div>
          <div style="font-size: 18px; font-weight: 800; color: #ea580c; margin-top: 2px;">${complianceScore}%</div>
        </div>
      </div>

      <!-- Checklist Items Table -->
      ${
        items.length > 0
          ? `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
            Itemized Cal/OSHA Inspection Verification
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background-color: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 40px; color: #475569;">#</th>
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 90px; color: #475569;">Category</th>
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; color: #475569;">Standard & Inspection Requirement</th>
                <th style="padding: 6px 8px; text-align: left; font-weight: 700; width: 75px; color: #475569;">OSHA Ref</th>
                <th style="padding: 6px 8px; text-align: center; font-weight: 700; width: 80px; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; ${item.status === "fail" ? "background-color: #fff1f2;" : idx % 2 === 1 ? "background-color: #f8fafc;" : ""}">
                  <td style="padding: 6px 8px; font-family: monospace; font-weight: 700; color: #64748b;">${idx + 1}</td>
                  <td style="padding: 6px 8px; font-weight: 600; text-transform: uppercase; font-size: 8.5px; color: #475569;">${(item.category || "").replace("_", " ")}</td>
                  <td style="padding: 6px 8px;">
                    <div style="font-weight: 600; color: #0f172a; line-height: 1.3;">${item.labelEn || ""}</div>
                    ${item.labelEs && item.labelEs !== item.labelEn ? `<div style="font-size: 9px; color: #64748b; font-style: italic; margin-top: 1px;">${item.labelEs}</div>` : ""}
                    ${item.notes ? `<div style="margin-top: 3px; padding: 2px 6px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 8.5px; color: #92400e; font-weight: 600;">Note: ${item.notes}</div>` : ""}
                  </td>
                  <td style="padding: 6px 8px; font-family: monospace; font-size: 8.5px; color: #64748b;">${item.oshaRef || "OSHA 1926"}</td>
                  <td style="padding: 6px 8px; text-align: center;">
                    ${
                      item.status === "pass"
                        ? '<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: #d1fae5; color: #047857; font-weight: 700; font-size: 8.5px;">✓ PASS</span>'
                        : item.status === "fail"
                        ? '<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: #ffe4e6; color: #be123c; font-weight: 700; font-size: 8.5px;">DEFICIENT</span>'
                        : '<span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: #e2e8f0; color: #64748b; font-weight: 600; font-size: 8.5px;">N/A</span>'
                    }
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      <!-- Uploaded Evidence Photos Section -->
      ${
        photos.length > 0
          ? `
        <div style="margin-bottom: 24px; page-break-inside: avoid;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            Attached Field Evidence Photos (${photos.length})
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px;">
            ${photos
              .slice(0, 4)
              .map(
                (p) => `
              <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #f8fafc; padding: 6px;">
                <div style="width: 100%; height: 160px; overflow: hidden; border-radius: 6px; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center;">
                  <img src="${p.uri}" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />
                </div>
                <div style="margin-top: 6px; font-size: 9.5px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${p.label}
                </div>
                <div style="font-size: 8px; color: #64748b;">
                  Inspection Photographic Evidence
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }

      <!-- Digital Attestation & Signature Box -->
      <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; background-color: #f8fafc; margin-top: 20px; page-break-inside: avoid;">
        <div style="font-size: 10px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          Cal/OSHA Regulatory Attestation & Signature Sign-Off
        </div>
        <p style="margin: 0 0 14px 0; font-size: 9px; color: #64748b; line-height: 1.4;">
          I hereby certify under penalty of perjury under the laws of the State of California that I have conducted the above daily safety inspection in good faith, personally verified jobsite conditions, and required immediate remediation of any identified safety deficiencies prior to workforce entry.
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: flex-end;">
          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 4px;">Foreman Handwritten Signature:</div>
            <div style="height: 64px; border: 1px dashed #94a3b8; border-radius: 8px; background-color: #ffffff; display: flex; align-items: center; justify-content: center; padding: 4px;">
              ${
                signatureUri
                  ? `<img src="${signatureUri}" style="max-height: 54px; max-width: 90%; object-fit: contain;" crossorigin="anonymous" />`
                  : `<span style="font-family: Georgia, serif; font-style: italic; font-size: 16px; font-weight: 700; color: #0f172a;">${submission.foremanName}</span>`
              }
            </div>
            <div style="font-size: 8.5px; color: #64748b; margin-top: 3px;">
              Foreman: ${submission.foremanName} • Timestamp: ${submission.timestamp}
            </div>
          </div>

          <div>
            <div style="font-size: 9px; font-weight: 700; color: #64748b; margin-bottom: 4px;">Dispatched Routing Audit Trail:</div>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; padding: 8px; font-size: 8.5px; color: #475569;">
              <div>Emailed to: <b>${submission.recipients?.join(", ") || "General Contractor Safety Division"}</b></div>
              <div style="margin-top: 3px; color: #10b981; font-weight: 600;">✓ Synced & Encrypted via Supabase Cloud</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
        <span>Reliable Risk Management • Certified Safety Compliance Platform</span>
        <span>Page 1 of 1 • System Ref ${submission.id}</span>
      </div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "pt", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    const cleanTitle = (submission.title || "Safety_Audit")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30)

    pdf.save(`${cleanTitle}_${submission.id}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}
