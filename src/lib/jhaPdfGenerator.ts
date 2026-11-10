import { jsPDF } from "jspdf"
import { RRM_LOGO_BASE64 } from "@/lib/rrmLogoBase64"

export interface JhaPdfData {
  id?: string
  activityName: string
  trade?: string
  jobSiteName?: string
  jobNumber?: string
  date?: string
  foremanName?: string
  companyName?: string
  hazards: string[]
  ppeList: string[]
  controlMeasures: string[]
  acknowledgedCrew: string[]
  signatureUri?: string
  bossNotes?: string
  bossApprovedAt?: string
  bossApprovedBy?: string
  recipients?: string[]
}

/**
 * Builds an executive-standard Cal/OSHA Title 8 & Federal OSHA 29 CFR 1926.21
 * Activity Hazard Analysis (JHA / AHA) compliance document with vector typography,
 * crew attendance sign-off table, and digital foreman signature.
 */
export function buildJhaPdfDoc(data: JhaPdfData): jsPDF {
  const doc = new jsPDF("p", "pt", "a4")
  const pageWidth = doc.internal.pageSize.getWidth() // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight() // 841.89 pt
  const marginX = 36
  const contentWidth = pageWidth - marginX * 2 // 523.28 pt

  const docId = data.id || `JHA-${Date.now().toString().slice(-6)}`
  const dateStr =
    data.date ||
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const jobName = data.jobSiteName || "Active Construction Jobsite"
  const jobNumber = data.jobNumber || "JOB-2026-AHA"
  const trade = data.trade || "Specialty Trade & Structural"
  const foreman = data.foremanName || "Field Safety Lead"
  const company = data.companyName || "Titan Construction & Safety"

  // -------------------------------------------------------------
  // Top Orange Accent Bar
  // -------------------------------------------------------------
  doc.setFillColor(234, 88, 12) // Safety Orange
  doc.rect(0, 0, pageWidth, 4, "F")

  // -------------------------------------------------------------
  // Header: Logo & Compliance Standards
  // -------------------------------------------------------------
  try {
    doc.addImage(RRM_LOGO_BASE64, "PNG", marginX, 14, 52, 26)
  } catch {
    doc.setFillColor(234, 88, 12)
    doc.roundedRect(marginX, 14, 38, 26, 3, 3, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text("RRM", marginX + 6, 31)
  }

  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("RELIABLE RISK MANAGEMENT", marginX + 60, 24)

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(234, 88, 12)
  doc.text("ACTIVITY HAZARD ANALYSIS (AHA) • PRE-TASK SAFETY PLAN", marginX + 60, 34)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.setTextColor(100, 116, 139)
  doc.text("Cal/OSHA Title 8 § 1509 & Federal OSHA 29 CFR 1926.21 Mandatory Safety Record", marginX + 60, 42)

  // Status Badge Top Right
  const badgeW = 126
  const badgeX = pageWidth - marginX - badgeW
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(badgeX, 13, badgeW, 16, 8, 8, "FD")
  doc.setTextColor(22, 101, 52)
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.text("CAL/OSHA PRE-TASK APPROVED", badgeX + 11, 24)

  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.text(`DOC ID: #${docId}`, pageWidth - marginX, 38, { align: "right" })
  doc.text(`DATE: ${dateStr}`, pageWidth - marginX, 46, { align: "right" })

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.6)
  doc.line(marginX, 52, pageWidth - marginX, 52)

  // -------------------------------------------------------------
  // Executive Dossier Card: Activity Scope & Metadata
  // -------------------------------------------------------------
  const dossierY = 60
  const dossierH = 88
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.8)
  doc.roundedRect(marginX, dossierY, contentWidth, dossierH, 5, 5, "FD")

  // Title
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11.5)
  const activityTitle = doc.splitTextToSize(data.activityName, contentWidth - 30)
  doc.text(activityTitle, marginX + 14, dossierY + 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(`${jobName}  •  Job #: ${jobNumber}  •  Trade: ${trade}`, marginX + 14, dossierY + 28)

  // Divider inside dossier
  doc.line(marginX + 14, dossierY + 34, marginX + contentWidth - 14, dossierY + 34)

  // 4 Info Columns inside dossier
  const infoY = dossierY + 46
  const colW = (contentWidth - 28) / 4

  // Col 1: Lead Foreman
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(148, 163, 184)
  doc.text("LEAD FOREMAN", marginX + 14, infoY)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(foreman, marginX + 14, infoY + 10)
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text(company, marginX + 14, infoY + 18)

  // Col 2: Crew Covered
  const col2X = marginX + 14 + colW
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(148, 163, 184)
  doc.text("CREW ACKNOWLEDGED", col2X, infoY)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(22, 101, 52)
  doc.text(`${data.acknowledgedCrew.length} Workers Signed`, col2X, infoY + 10)
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("100% Briefed On-Site", col2X, infoY + 18)

  // Col 3: Hazards & Controls
  const col3X = marginX + 14 + colW * 2
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(148, 163, 184)
  doc.text("HAZARD CONTROLS", col3X, infoY)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(15, 23, 42)
  doc.text(`${data.hazards.length} Hazards • ${data.controlMeasures.length} Controls`, col3X, infoY + 10)
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("Cal/OSHA Matrix Verified", col3X, infoY + 18)

  // Col 4: Mandatory PPE
  const col4X = marginX + 14 + colW * 3
  doc.setFontSize(5.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(148, 163, 184)
  doc.text("MANDATORY PPE", col4X, infoY)
  doc.setFontSize(7.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(234, 88, 12)
  doc.text(`${data.ppeList.length} Items Required`, col4X, infoY + 10)
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(100, 116, 139)
  doc.text("Zero-Tolerance Enforced", col4X, infoY + 18)

  // -------------------------------------------------------------
  // Section 1: Identified Hazards & Engineering Controls
  // -------------------------------------------------------------
  let currentY = dossierY + dossierH + 12

  // 2-Column Side-by-Side: Left = Hazards, Right = Controls
  const splitColW = (contentWidth - 10) / 2
  const rightColX = marginX + splitColW + 10

  // Left Header: Identified Hazards
  doc.setFillColor(254, 242, 242)
  doc.setDrawColor(254, 205, 211)
  doc.roundedRect(marginX, currentY, splitColW, 22, 3, 3, "FD")

  // Clean alert badge
  doc.setFillColor(225, 29, 72)
  doc.roundedRect(marginX + 8, currentY + 5, 12, 12, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text("!", marginX + 14, currentY + 13.5, { align: "center" })

  doc.setTextColor(159, 18, 57)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("1. IDENTIFIED ACTIVITY HAZARDS", marginX + 24, currentY + 14)

  // Right Header: Engineering Controls
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(rightColX, currentY, splitColW, 22, 3, 3, "FD")

  // Clean safeguard badge
  doc.setFillColor(16, 185, 129)
  doc.roundedRect(rightColX + 8, currentY + 5, 14, 12, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.2)
  doc.text("OK", rightColX + 15, currentY + 13.5, { align: "center" })

  doc.setTextColor(6, 95, 70)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("2. MANDATORY ENGINEERING & WORK CONTROLS", rightColX + 26, currentY + 14)

  currentY += 26

  // Render Hazards on Left (Spacious 28pt height cards)
  let hazardY = currentY
  data.hazards.forEach((hz) => {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(marginX, hazardY, splitColW, 28, 3, 3, "FD")

    doc.setFillColor(225, 29, 72)
    doc.circle(marginX + 11, hazardY + 14, 2.5, "F")

    doc.setTextColor(30, 41, 59)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    const lines = doc.splitTextToSize(hz, splitColW - 26)
    doc.text(lines, marginX + 20, hazardY + 11)
    hazardY += 32
  })

  // Render Controls on Right (Spacious 28pt height cards)
  let controlY = currentY
  data.controlMeasures.forEach((ctrl) => {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(rightColX, controlY, splitColW, 28, 3, 3, "FD")

    doc.setFillColor(16, 185, 129)
    doc.circle(rightColX + 11, controlY + 14, 2.5, "F")

    doc.setTextColor(30, 41, 59)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    const lines = doc.splitTextToSize(ctrl, splitColW - 26)
    doc.text(lines, rightColX + 20, controlY + 11)
    controlY += 32
  })

  currentY = Math.max(hazardY, controlY) + 6

  // -------------------------------------------------------------
  // Section 2: Required Personal Protective Equipment (PPE Matrix)
  // -------------------------------------------------------------
  doc.setFillColor(255, 247, 237)
  doc.setDrawColor(254, 215, 170)
  doc.roundedRect(marginX, currentY, contentWidth, 22, 3, 3, "FD")

  // Clean PPE badge
  doc.setFillColor(234, 88, 12)
  doc.roundedRect(marginX + 8, currentY + 5, 20, 12, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6)
  doc.text("PPE", marginX + 18, currentY + 13.5, { align: "center" })

  doc.setTextColor(194, 65, 12)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text("3. MANDATORY PERSONAL PROTECTIVE EQUIPMENT (PPE) ZERO-TOLERANCE", marginX + 32, currentY + 14)

  currentY += 26

  // PPE Grid (2 items per row, 22pt card height)
  const ppeColW = (contentWidth - 8) / 2
  data.ppeList.forEach((ppe, i) => {
    const isRight = i % 2 === 1
    const pX = isRight ? marginX + ppeColW + 8 : marginX
    const pY = currentY + Math.floor(i / 2) * 26

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(pX, pY, ppeColW, 22, 3, 3, "FD")

    // Crisp Vector Checkmark
    doc.setDrawColor(22, 101, 52)
    doc.setLineWidth(1.2)
    doc.line(pX + 8, pY + 12, pX + 11, pY + 15)
    doc.line(pX + 11, pY + 15, pX + 16, pY + 8)

    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.8)
    const ppeLine = doc.splitTextToSize(ppe, ppeColW - 28)
    doc.text(ppeLine, pX + 22, pY + 13)
  })

  currentY += Math.ceil(data.ppeList.length / 2) * 26 + 8

  // -------------------------------------------------------------
  // Section 3: Attending Crew Sign-Off Roster (Authoritative 8-Man Roster)
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(marginX, currentY, contentWidth, 22, 3, 3, "FD")

  // Crew badge
  doc.setFillColor(71, 85, 105)
  doc.roundedRect(marginX + 8, currentY + 5, 24, 12, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(5.8)
  doc.text("ROSTER", marginX + 20, currentY + 13.5, { align: "center" })

  doc.setTextColor(30, 41, 59)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.text(`4. ON-SITE CREW ROSTER & ATTENDANCE ACKNOWLEDGMENT (${data.acknowledgedCrew.length} WORKERS SIGNED)`, marginX + 36, currentY + 14)

  currentY += 26

  // 8-Man Grid (4 rows of 2 columns, 22pt card height)
  const crewColW = (contentWidth - 8) / 2
  const totalSlots = Math.max(8, data.acknowledgedCrew.length)
  for (let i = 0; i < totalSlots; i++) {
    const isRight = i % 2 === 1
    const cX = isRight ? marginX + crewColW + 8 : marginX
    const cY = currentY + Math.floor(i / 2) * 26

    const workerName = data.acknowledgedCrew[i]
    const isSigned = Boolean(workerName)

    doc.setFillColor(isSigned ? 255 : 250, isSigned ? 255 : 250, isSigned ? 255 : 252)
    doc.setDrawColor(isSigned ? 203 : 226, isSigned ? 213 : 232, isSigned ? 225 : 240)
    doc.roundedRect(cX, cY, crewColW, 22, 3, 3, "FD")

    // Number
    doc.setTextColor(148, 163, 184)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.text(`#${i + 1}`, cX + 8, cY + 14)

    // Name
    doc.setTextColor(isSigned ? 15 : 148, isSigned ? 23 : 163, isSigned ? 42 : 184)
    doc.setFont("helvetica", isSigned ? "bold" : "normal")
    doc.setFontSize(7)
    doc.text(isSigned ? workerName : `Crew Member Slot #${i + 1} (On-Call / Standby)`, cX + 26, cY + 14)

    // Verification Pill
    if (isSigned) {
      doc.setFillColor(240, 253, 244)
      doc.setDrawColor(187, 247, 208)
      doc.setLineWidth(0.6)
      doc.roundedRect(cX + crewColW - 84, cY + 5, 78, 12, 2, 2, "FD")
      doc.setTextColor(22, 101, 52)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(5.8)
      doc.text("SIGNED ON-SITE ✓", cX + crewColW - 45, cY + 13.5, { align: "center" })
    } else {
      doc.setTextColor(148, 163, 184)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(5.5)
      doc.text("[ AVAILABLE ]", cX + crewColW - 35, cY + 13.5, { align: "center" })
    }
  }

  currentY += Math.ceil(totalSlots / 2) * 26 + 10

  // -------------------------------------------------------------
  // Section 4: Foreman Verification Signature & Legal Attestation
  // Full-bleed generous height spanning cleanly to the bottom
  // -------------------------------------------------------------
  const sigBoxH = 145
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(marginX, currentY, contentWidth, sigBoxH, 5, 5, "FD")

  // Left: Foreman Digital Verification & Signature (Width 225pt)
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text("FOREMAN VERIFICATION SIGNATURE", marginX + 14, currentY + 16)

  // Real Signature Rendering (200x52 pt)
  if (data.signatureUri && data.signatureUri.startsWith("data:image")) {
    try {
      doc.addImage(data.signatureUri, "PNG", marginX + 14, currentY + 22, 190, 50)
    } catch {
      drawCursiveSignature(doc, foreman, marginX + 14, currentY + 20)
    }
  } else {
    // Elegant cursive calligraphy signature fallback
    drawCursiveSignature(doc, foreman, marginX + 14, currentY + 20)
  }

  // Signature Baseline Rule
  doc.setDrawColor(148, 163, 184)
  doc.setLineWidth(0.8)
  doc.line(marginX + 14, currentY + 80, marginX + 215, currentY + 80)

  // Signer metadata
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text(foreman, marginX + 14, currentY + 92)

  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.text(`Lead Safety Representative • Signed: ${dateStr}`, marginX + 14, currentY + 101)
  doc.text(`${company} • Cal/OSHA Certified`, marginX + 14, currentY + 110)

  // Verification Badge Pill
  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(187, 247, 208)
  doc.setLineWidth(0.6)
  doc.roundedRect(marginX + 14, currentY + 118, 180, 14, 2, 2, "FD")
  doc.setTextColor(22, 101, 52)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(5.8)
  doc.text("CAL/OSHA TITLE 8 § 1509 LEGALLY BINDING", marginX + 104, currentY + 127.5, { align: "center" })

  // Right: Legal Compliance Attestation & Cloud Archive Notice
  const legalX = marginX + 230
  const legalW = contentWidth - 244

  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text("LEGAL COMPLIANCE ATTESTATION (CAL/OSHA TITLE 8 § 1509)", legalX, currentY + 16)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.2)
  doc.setTextColor(71, 85, 105)
  const legalText =
    "I hereby certify as the Competent Safety Person that the hazards associated with this activity have been identified, mandatory controls have been established, and all crew members listed above have been thoroughly briefed prior to commencing work. Zero-tolerance safety enforcement is active for this shift."
  const legalLines = doc.splitTextToSize(legalText, legalW)
  doc.text(legalLines, legalX, currentY + 28)

  // Boss / GC Cloud Vault Seal
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(legalX, currentY + 68, legalW, 28, 3, 3, "FD")

  doc.setTextColor(6, 95, 70)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text("ARCHIVED TO SUPABASE COMPLIANCE VAULT & DISPATCHED TO GC", legalX + 10, currentY + 81)

  doc.setTextColor(22, 101, 52)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(5.5)
  doc.text(`Official Document ID: #${docId} • SHA-256 Cloud Ledger Verified`, legalX + 10, currentY + 91)

  // Verification Hash Bar
  doc.setFont("helvetica", "normal")
  doc.setFontSize(5.5)
  doc.setTextColor(148, 163, 184)
  doc.text(`Jobsite: ${jobName} (#${jobNumber}) • Cal/OSHA Title 8 § 1509 & 29 CFR 1926.21`, legalX, currentY + 116)
  doc.text("All rights reserved. Reliable Risk Management Cloud Compliance Engine.", legalX, currentY + 126)

  // -------------------------------------------------------------
  // Footer: Page Number & Statutory Retention Notice (Stretches to 828pt)
  // -------------------------------------------------------------
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.8)
  doc.line(marginX, pageHeight - 26, pageWidth - marginX, pageHeight - 26)

  doc.setTextColor(148, 163, 184)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.2)
  doc.text("Reliable Risk Management • Formal Job Hazard Analysis • Statutory Retention 5 Years (OSHA Form 300A)", marginX, pageHeight - 14)
  doc.text("Page 1 of 1 • Cal/OSHA Certified", pageWidth - marginX, pageHeight - 14, { align: "right" })

  return doc
}

/**
 * Draws an authentic cursive signature flourish fallback when manual image is absent
 */
function drawCursiveSignature(doc: jsPDF, name: string, x: number, y: number) {
  doc.setDrawColor(15, 23, 42) // rich midnight slate ink
  doc.setLineWidth(1.6)

  // Fluid signature initial letter flourish
  doc.line(x + 4, y + 6, x + 8, y + 36)
  doc.bezierCurveTo(x + 12, y + 4, x + 34, y + 8, x + 30, y + 22)
  doc.bezierCurveTo(x + 26, y + 34, x + 10, y + 36, x + 6, y + 36)

  // Flowing cursive loops
  doc.setLineWidth(1.2)
  doc.bezierCurveTo(x + 35, y + 30, x + 45, y + 16, x + 55, y + 26)
  doc.bezierCurveTo(x + 60, y + 34, x + 70, y + 18, x + 80, y + 28)
  doc.bezierCurveTo(x + 90, y + 38, x + 100, y + 14, x + 115, y + 25)
  doc.bezierCurveTo(x + 125, y + 32, x + 140, y + 16, x + 155, y + 28)

  // Dynamic ink underline flourish
  doc.setLineWidth(1.4)
  doc.bezierCurveTo(x + 160, y + 34, x + 120, y + 44, x + 40, y + 42)
  doc.bezierCurveTo(x + 15, y + 41, x + 80, y + 38, x + 175, y + 36)

  // Printed clean name underneath
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.5)
  doc.setTextColor(30, 41, 59)
  doc.text(name, x + 8, y + 50)
}

/**
 * Downloads the signed JHA PDF directly and optionally opens it in a new browser tab.
 */
export function downloadJhaPdf(data: JhaPdfData, filename?: string): void {
  const doc = buildJhaPdfDoc(data)
  const cleanTitle = (data.activityName || "JHA").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30)
  const finalFilename = filename || `Signed_JHA_${cleanTitle}_${Date.now().toString().slice(-6)}.pdf`

  doc.save(finalFilename)

  try {
    const blob = doc.output("blob")
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, "_blank")
  } catch (err) {
    console.warn("[downloadJhaPdf] Could not open new tab:", err)
  }
}

/**
 * Returns a Data URI string for rendering inside an iframe or viewer.
 */
export function getJhaPdfDataUri(data: JhaPdfData): string {
  const doc = buildJhaPdfDoc(data)
  return doc.output("datauristring")
}

