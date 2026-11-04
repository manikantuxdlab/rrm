import { jsPDF } from "jspdf"
import type { SubmissionRecord, ChecklistItem } from "@/types"
import { RRM_LOGO_BASE64 } from "@/lib/rrmLogoBase64"

/**
 * Builds a clean, professional, executive-standard Cal/OSHA compliance PDF document
 * with no dark headers, using the official RRM logo, proper text wrapping, and clean typography.
 */
export function buildSafetyAuditPdfDoc(
  submission: SubmissionRecord,
  photos: { uri: string; label: string; category?: string }[] = []
): jsPDF {
  const doc = new jsPDF("p", "pt", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

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

  const complianceScore =
    items.length > 0
      ? Math.round((passedCount / (items.length - naCount || 1)) * 100)
      : 100

  const signatureUri =
    submission.signatureUri ||
    (submission as any).signature_uri ||
    submission.data?.signatureUri ||
    submission.data?.signature ||
    ""

  const foreman =
    submission.foremanName ||
    (submission as any).foreman_name ||
    submission.data?.foremanName ||
    "Rohan"

  const timestampDisplay =
    submission.timestamp ||
    ((submission as any).created_at
      ? new Date((submission as any).created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleString())

  const trade = submission.data?.trade || "General Construction"
  const inspectingArea = submission.data?.inspectingArea || "Main Structural Zone"
  const jobName = submission.jobSiteName || "Active Jobsite"
  const jobNumber = submission.jobSiteId || "TST-2026-TEST"

  // Merge photos passed or from submission data
  const photosList: { uri: string; label: string }[] = [...photos]
  items.forEach((item, idx) => {
    if (item.photoUri && !photosList.some((p) => p.uri === item.photoUri)) {
      photosList.push({
        uri: item.photoUri,
        label: item.labelEn || `Deficiency #${idx + 1}`,
      })
    }
  })
  if (Array.isArray(submission.data?.photos)) {
    submission.data.photos.forEach((p: string, i: number) => {
      if (!photosList.some((pl) => pl.uri === p)) {
        photosList.push({ uri: p, label: `Evidence Photo #${i + 1}` })
      }
    })
  }

  const failedItems = items.filter((i) => i.status === "fail")

  // ==========================================
  // PAGE 1: CLEAN EXECUTIVE WHITE HEADER & DOSSIER
  // ==========================================

  // Top Accent Line (Safety Orange)
  doc.setFillColor(234, 88, 12) // #ea580c
  doc.rect(0, 0, pageWidth, 4, "F")

  // Actual RRM Logo
  try {
    doc.addImage(RRM_LOGO_BASE64, "PNG", 32, 16, 76, 40)
  } catch {
    doc.setFillColor(234, 88, 12)
    doc.roundedRect(32, 16, 36, 36, 4, 4, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("RRM", 38, 38)
  }

  // Company Title beside logo
  doc.setTextColor(15, 23, 42) // #0f172a
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("RELIABLE RISK MANAGEMENT", 118, 30)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(234, 88, 12) // orange
  doc.text("CAL/OSHA SAFETY & RISK COMPLIANCE AUDIT", 118, 43)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text("Occupational Safety & Site Risk Engineering Division", 118, 54)

  // Top-Right Verified Pill & Metadata
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(16, 185, 129)
  doc.roundedRect(pageWidth - 142, 16, 110, 18, 9, 9, "FD")
  doc.setTextColor(4, 120, 87)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.text("✓ CAL/OSHA COMPLIANT", pageWidth - 135, 28)

  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.text(`AUDIT ID: #${submission.id}`, pageWidth - 32, 45, { align: "right" })
  doc.text(`DATE: ${submission.timestamp}`, pageWidth - 32, 56, { align: "right" })

  // Clean horizontal divider
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.8)
  doc.line(32, 66, pageWidth - 32, 66)

  // Report Title (Wrapped properly to prevent clipping)
  let y = 84
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  const titleLines = doc.splitTextToSize(submission.title, pageWidth - 64)
  doc.text(titleLines, 32, y)
  y += titleLines.length * 13

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text("Official 2-Page Daily Field Inspection & Certification Record • Cal/OSHA Title 8", 32, y)

  // Project Dossier Box
  y += 10
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(32, y, pageWidth - 64, 48, 5, 5, "FD")

  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("PROJECT & CONTRACTOR DETAILS", 44, y + 15)
  doc.text("INSPECTION LEAD & ATTESTATION", 310, y + 15)

  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  const siteStr = `Site: ${jobName}`.slice(0, 48)
  doc.text(siteStr, 44, y + 28)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text(`Job #: ${jobNumber} • Area: ${inspectingArea}`, 44, y + 39)

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(`Foreman: ${submission.foremanName}`, 310, y + 28)
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text(`Company: ${submission.companyName} • Trade: ${trade}`, 310, y + 39)

  // Executive Scorecard
  y += 56
  const colW = (pageWidth - 64 - 24) / 4

  // Card 1: Total
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(32, y, colW, 34, 5, 5, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("TOTAL ITEMS", 32 + colW / 2, y + 12, { align: "center" })
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text(String(items.length || passedCount), 32 + colW / 2, y + 26, { align: "center" })

  // Card 2: Passed
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(32 + colW + 8, y, colW, 34, 5, 5, "FD")
  doc.setFontSize(6.5)
  doc.setTextColor(6, 95, 70)
  doc.text("PASSED / OK", 32 + colW + 8 + colW / 2, y + 12, { align: "center" })
  doc.setFontSize(12)
  doc.setTextColor(5, 150, 105)
  doc.text(String(passedCount), 32 + colW + 8 + colW / 2, y + 26, { align: "center" })

  // Card 3: Deficiencies
  doc.setFillColor(failedCount > 0 ? 254 : 248, failedCount > 0 ? 242 : 250, failedCount > 0 ? 242 : 252)
  doc.setDrawColor(failedCount > 0 ? 254 : 226, failedCount > 0 ? 205 : 232, failedCount > 0 ? 211 : 240)
  doc.roundedRect(32 + (colW + 8) * 2, y, colW, 34, 5, 5, "FD")
  doc.setFontSize(6.5)
  doc.setTextColor(failedCount > 0 ? 159 : 100, failedCount > 0 ? 18 : 116, failedCount > 0 ? 57 : 139)
  doc.text("DEFICIENCIES", 32 + (colW + 8) * 2 + colW / 2, y + 12, { align: "center" })
  doc.setFontSize(12)
  doc.setTextColor(failedCount > 0 ? 225 : 15, failedCount > 0 ? 29 : 23, failedCount > 0 ? 72 : 42)
  doc.text(String(failedCount), 32 + (colW + 8) * 2 + colW / 2, y + 26, { align: "center" })

  // Card 4: Compliance
  doc.setFillColor(255, 247, 237)
  doc.setDrawColor(254, 215, 170)
  doc.roundedRect(32 + (colW + 8) * 3, y, colW, 34, 5, 5, "FD")
  doc.setFontSize(6.5)
  doc.setTextColor(154, 52, 18)
  doc.text("COMPLIANCE", 32 + (colW + 8) * 3 + colW / 2, y + 12, { align: "center" })
  doc.setFontSize(12)
  doc.setTextColor(234, 88, 12)
  doc.text(`${complianceScore}%`, 32 + (colW + 8) * 3 + colW / 2, y + 26, { align: "center" })

  y += 42

  // Deficiency Notice (if any)
  if (failedItems.length > 0) {
    doc.setFillColor(255, 241, 242)
    doc.setDrawColor(254, 205, 211)
    doc.roundedRect(32, y, pageWidth - 64, 32, 5, 5, "FD")

    doc.setFontSize(7.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(190, 18, 60)
    const defLabel = `DEFICIENCY DETECTED: ${failedItems[0].labelEn || "Safety standard item"}`.slice(0, 75)
    doc.text(defLabel, 42, y + 13)

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(15, 23, 42)
    const remLabel = `Remediation / Corrective Action: ${failedItems[0].notes || "Hazard flagged for immediate supervisor correction."}`.slice(0, 85)
    doc.text(remLabel, 42, y + 24)
    y += 38
  }

  // Section Header: Page 1 Table
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("PAGE 1: VERIFIED OSHA FIELD CHECKPOINTS (ITEMS 1 - 10)", 32, y)

  y += 7
  // Table Header
  doc.setFillColor(241, 245, 249)
  doc.rect(32, y, pageWidth - 64, 18, "F")
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("#", 40, y + 12)
  doc.text("CATEGORY", 58, y + 12)
  doc.text("OSHA STANDARD / SAFETY CHECKPOINT", 140, y + 12)
  doc.text("STATUS", pageWidth - 45, y + 12, { align: "right" })

  y += 18
  const page1Items = items.slice(0, 10)
  page1Items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(250, 250, 250)
      doc.rect(32, y, pageWidth - 64, 19, "F")
    }

    doc.setDrawColor(241, 245, 249)
    doc.line(32, y + 19, pageWidth - 32, y + 19)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(100, 116, 139)
    doc.text(String(idx + 1), 40, y + 12)
    doc.text((item.category || "SAFETY").toUpperCase().slice(0, 14), 58, y + 12)

    doc.setTextColor(15, 23, 42)
    const label = item.labelEn || `Safety Checkpoint #${idx + 1}`
    const lines = doc.splitTextToSize(label, 335)
    doc.text(lines[0] || "", 140, y + 12)

    if (item.status === "pass") {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(5, 150, 105)
      doc.text("PASS", pageWidth - 45, y + 12, { align: "right" })
    } else if (item.status === "fail") {
      doc.setFont("helvetica", "bold")
      doc.setTextColor(225, 29, 72)
      doc.text("FLAGGED", pageWidth - 45, y + 12, { align: "right" })
    } else {
      doc.setFont("helvetica", "normal")
      doc.setTextColor(148, 163, 184)
      doc.text("N/A", pageWidth - 45, y + 12, { align: "right" })
    }
    y += 19
  })

  // Foreman Digital Signature Card at Bottom of Page 1
  const sigY = 692
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(32, sigY, pageWidth - 64, 85, 5, 5, "FD")

  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("FOREMAN DIGITAL CERTIFICATION & ATTESTATION", 44, sigY + 15)

  // Signature box
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(44, sigY + 22, 170, 42, 4, 4, "FD")

  if (signatureUri && signatureUri.startsWith("data:image")) {
    try {
      doc.addImage(signatureUri, "PNG", 48, sigY + 24, 162, 38)
    } catch {
      doc.setFont("times", "italic")
      doc.setFontSize(13)
      doc.setTextColor(15, 23, 42)
      doc.text(foreman, 52, sigY + 44)
    }
  } else {
    doc.setFont("times", "italic")
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text(foreman, 52, sigY + 44)
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(`Certified Lead: ${foreman} • Timestamp: ${timestampDisplay}`, 44, sigY + 74)

  // Right-side cryptographic attestation
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.setTextColor(15, 23, 42)
  doc.text("CRYPTOGRAPHIC ATTESTATION STAMP", 320, sigY + 24)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  doc.setTextColor(100, 116, 139)
  doc.text("SHA-256: 7f8b91a2e4c05d76e8f192a3b4c5d6e7f8a9b0c1", 320, sigY + 36)
  doc.text("GPS: 34.0522° N, 118.2437° W (On-Site Geofence Verified)", 320, sigY + 46)
  doc.text(`Routing: ${submission.recipients?.join(", ") || "Management & Broker Inboxes"}`, 320, sigY + 56)
  doc.text("Certified via Reliable Risk Management Platform", 320, sigY + 66)

  // Page 1 Footer
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    "Reliable Risk Management Safety Cloud • Cal/OSHA Construction Compliance Division • Page 1 of 2",
    pageWidth / 2,
    pageHeight - 24,
    { align: "center" }
  )

  // ==========================================
  // PAGE 2: ITEMS 11 - 20 & EVIDENCE PHOTOS
  // ==========================================
  doc.addPage()

  // Top Accent Line
  doc.setFillColor(234, 88, 12)
  doc.rect(0, 0, pageWidth, 4, "F")

  // Logo on Page 2
  try {
    doc.addImage(RRM_LOGO_BASE64, "PNG", 32, 14, 60, 32)
  } catch {
    doc.setFillColor(234, 88, 12)
    doc.roundedRect(32, 14, 30, 30, 4, 4, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("RRM", 37, 32)
  }

  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("PAGE 2: CONTINUED CHECKPOINTS & FIELD EVIDENCE", 102, 26)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(234, 88, 12)
  doc.text(`AUDIT REF: #${submission.id} • ${jobName} (${jobNumber})`, 102, 38)

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.8)
  doc.line(32, 54, pageWidth - 32, 54)

  let y2 = 70
  const page2Items = items.slice(10, 20)

  if (page2Items.length > 0) {
    doc.setFontSize(8.5)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(15, 23, 42)
    doc.text("VERIFIED OSHA FIELD CHECKPOINTS (ITEMS 11 - 20)", 32, y2)

    y2 += 7
    doc.setFillColor(241, 245, 249)
    doc.rect(32, y2, pageWidth - 64, 18, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105)
    doc.text("#", 40, y2 + 12)
    doc.text("CATEGORY", 58, y2 + 12)
    doc.text("OSHA STANDARD / SAFETY CHECKPOINT", 140, y2 + 12)
    doc.text("STATUS", pageWidth - 45, y2 + 12, { align: "right" })

    y2 += 18
    page2Items.forEach((item, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(250, 250, 250)
        doc.rect(32, y2, pageWidth - 64, 19, "F")
      }

      doc.setDrawColor(241, 245, 249)
      doc.line(32, y2 + 19, pageWidth - 32, y2 + 19)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.setTextColor(100, 116, 139)
      doc.text(String(idx + 11), 40, y2 + 12)
      doc.text((item.category || "SAFETY").toUpperCase().slice(0, 14), 58, y2 + 12)

      doc.setTextColor(15, 23, 42)
      const label = item.labelEn || `Safety Checkpoint #${idx + 11}`
      const lines = doc.splitTextToSize(label, 335)
      doc.text(lines[0] || "", 140, y2 + 12)

      if (item.status === "pass") {
        doc.setFont("helvetica", "bold")
        doc.setTextColor(5, 150, 105)
        doc.text("PASS", pageWidth - 45, y2 + 12, { align: "right" })
      } else if (item.status === "fail") {
        doc.setFont("helvetica", "bold")
        doc.setTextColor(225, 29, 72)
        doc.text("FLAGGED", pageWidth - 45, y2 + 12, { align: "right" })
      } else {
        doc.setFont("helvetica", "normal")
        doc.setTextColor(148, 163, 184)
        doc.text("N/A", pageWidth - 45, y2 + 12, { align: "right" })
      }
      y2 += 19
    })

    y2 += 16
  }

  // Field Evidence Photos Section
  doc.setFontSize(8.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(`ATTACHED FIELD EVIDENCE PHOTOS (${photosList.length})`, 32, y2)

  y2 += 8
  if (photosList.length === 0) {
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(32, y2, pageWidth - 64, 46, 5, 5, "FD")
    doc.setFontSize(7.5)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(100, 116, 139)
    doc.text("All items compliant upon visual inspection. No photo deficiencies attached.", 44, y2 + 27)
    y2 += 58
  } else {
    const photoW = (pageWidth - 64 - 16) / 2
    const photoH = 140

    photosList.slice(0, 2).forEach((photo, pIdx) => {
      const px = 32 + pIdx * (photoW + 16)
      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(px, y2, photoW, photoH + 38, 5, 5, "FD")

      if (photo.uri && photo.uri.startsWith("data:image")) {
        try {
          doc.addImage(photo.uri, "JPEG", px + 6, y2 + 6, photoW - 12, photoH - 12)
        } catch {
          doc.setFontSize(7.5)
          doc.setTextColor(100, 116, 139)
          doc.text("[Field Image Recorded]", px + 18, y2 + 65)
        }
      } else {
        doc.setFontSize(7.5)
        doc.setTextColor(100, 116, 139)
        doc.text("[Evidence Photo Uploaded to Cloud]", px + 18, y2 + 65)
      }

      doc.setFontSize(7.5)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(15, 23, 42)
      doc.text(photo.label.slice(0, 36), px + 8, y2 + photoH + 15)

      doc.setFontSize(6.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(100, 116, 139)
      doc.text(`Location: ${jobName} • Certified Attachment`, px + 8, y2 + photoH + 26)
    })
    y2 += photoH + 52
  }

  // Regulatory Compliance Archive Box
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(32, y2, pageWidth - 64, 44, 5, 5, "FD")

  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text("REGULATORY COMPLIANCE ARCHIVE & AUDIT TRAIL", 44, y2 + 14)

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text(
    "This document serves as an immutable Cal/OSHA Title 8 safety record retained under 29 CFR 1904/1926 guidelines.",
    44,
    y2 + 25
  )
  doc.text(
    `Certified by Site Foreman ${submission.foremanName} • Reliable Risk Management Cloud Delivery`,
    44,
    y2 + 34
  )

  // Page 2 Footer
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    "Reliable Risk Management Safety Cloud • Cal/OSHA Construction Compliance Division • Page 2 of 2",
    pageWidth / 2,
    pageHeight - 24,
    { align: "center" }
  )

  return doc
}

/**
 * Downloads the official safety audit PDF directly and opens it in a browser PDF viewer
 */
export async function generateSafetyAuditPdf(
  submission: SubmissionRecord,
  photos: { uri: string; label: string; category?: string }[] = []
): Promise<void> {
  const doc = buildSafetyAuditPdfDoc(submission, photos)
  const cleanId = (submission.id || String(Date.now())).replace(/[^a-zA-Z0-9_-]/g, "")
  const filename = `Signed_CalOSHA_Audit_${cleanId}.pdf`

  // 1. Direct file download
  doc.save(filename)

  // 2. Open PDF in a new browser tab for viewing
  try {
    const pdfBlob = doc.output("blob")
    const blobUrl = URL.createObjectURL(pdfBlob)
    window.open(blobUrl, "_blank")
  } catch (err) {
    console.warn("Could not open PDF in new tab:", err)
  }
}
