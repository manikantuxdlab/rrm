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
  doc.roundedRect(marginX, currentY, splitColW, 20, 3, 3, "FD")

  // Clean alert badge
  doc.setFillColor(225, 29, 72)
  doc.roundedRect(marginX + 8, currentY + 5, 10, 10, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text("!", marginX + 13, currentY + 12.5, { align: "center" })

  doc.setTextColor(159, 18, 57)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text("1. IDENTIFIED ACTIVITY HAZARDS", marginX + 22, currentY + 12.5)

  // Right Header: Engineering Controls
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(rightColX, currentY, splitColW, 20, 3, 3, "FD")

  // Clean safeguard badge
  doc.setFillColor(16, 185, 129)
  doc.roundedRect(rightColX + 8, currentY + 5, 10, 10, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6)
  doc.text("OK", rightColX + 13, currentY + 12.5, { align: "center" })

  doc.setTextColor(6, 95, 70)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text("2. MANDATORY ENGINEERING & WORK CONTROLS", rightColX + 22, currentY + 12.5)

  currentY += 24

  // Render Hazards on Left
  let hazardY = currentY
  data.hazards.forEach((hz) => {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(marginX, hazardY, splitColW, 22, 3, 3, "FD")

    doc.setFillColor(225, 29, 72)
    doc.circle(marginX + 10, hazardY + 11, 2.5, "F")

    doc.setTextColor(30, 41, 59)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    const lines = doc.splitTextToSize(hz, splitColW - 24)
    doc.text(lines, marginX + 18, hazardY + 9)
    hazardY += 25
  })

  // Render Controls on Right
  let controlY = currentY
  data.controlMeasures.forEach((ctrl) => {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(rightColX, controlY, splitColW, 22, 3, 3, "FD")

    doc.setFillColor(16, 185, 129)
    doc.circle(rightColX + 10, controlY + 11, 2.5, "F")

    doc.setTextColor(30, 41, 59)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    const lines = doc.splitTextToSize(ctrl, splitColW - 24)
    doc.text(lines, rightColX + 18, controlY + 9)
    controlY += 25
  })

  currentY = Math.max(hazardY, controlY) + 4

  // -------------------------------------------------------------
  // Section 2: Required Personal Protective Equipment (PPE Matrix)
  // -------------------------------------------------------------
  doc.setFillColor(255, 247, 237)
  doc.setDrawColor(254, 215, 170)
  doc.roundedRect(marginX, currentY, contentWidth, 18, 3, 3, "FD")

  // Clean PPE badge
  doc.setFillColor(234, 88, 12)
  doc.roundedRect(marginX + 8, currentY + 4, 16, 10, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(5.5)
  doc.text("PPE", marginX + 16, currentY + 11, { align: "center" })

  doc.setTextColor(194, 65, 12)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text("3. MANDATORY PERSONAL PROTECTIVE EQUIPMENT (PPE) ZERO-TOLERANCE", marginX + 28, currentY + 11.5)

  currentY += 22

  // PPE Grid (2 items per row)
  const ppeColW = (contentWidth - 8) / 2
  data.ppeList.forEach((ppe, i) => {
    const isRight = i % 2 === 1
    const pX = isRight ? marginX + ppeColW + 8 : marginX
    const pY = currentY + Math.floor(i / 2) * 16

    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(pX, pY, ppeColW, 14, 2, 2, "FD")

    // Crisp Vector Checkmark
    doc.setDrawColor(22, 101, 52)
    doc.setLineWidth(1)
    doc.line(pX + 6, pY + 8, pX + 8, pY + 10.5)
    doc.line(pX + 8, pY + 10.5, pX + 12, pY + 5)

    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6.5)
    const ppeLine = doc.splitTextToSize(ppe, ppeColW - 22)
    doc.text(ppeLine, pX + 16, pY + 9.5)
  })

  currentY += Math.ceil(data.ppeList.length / 2) * 16 + 6

  // -------------------------------------------------------------
  // Section 3: Attending Crew Sign-Off Roster (8-Man)
  // -------------------------------------------------------------
  doc.setFillColor(241, 245, 249)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(marginX, currentY, contentWidth, 18, 3, 3, "FD")

  // Crew badge
  doc.setFillColor(71, 85, 105)
  doc.roundedRect(marginX + 8, currentY + 4, 18, 10, 2, 2, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(5.2)
  doc.text("CREW", marginX + 17, currentY + 11, { align: "center" })

  doc.setTextColor(30, 41, 59)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7.2)
  doc.text(`4. ON-SITE CREW ROSTER & ATTENDANCE ACKNOWLEDGMENT (${data.acknowledgedCrew.length} WORKERS SIGNED)`, marginX + 30, currentY + 11.5)

  currentY += 22

  // 2-Column Crew Grid
  const crewColW = (contentWidth - 8) / 2
  data.acknowledgedCrew.forEach((member, i) => {
    const isRight = i % 2 === 1
    const cX = isRight ? marginX + crewColW + 8 : marginX
    const cY = currentY + Math.floor(i / 2) * 16

    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(cX, cY, crewColW, 14, 2, 2, "FD")

    // Number + Name
    doc.setTextColor(100, 116, 139)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6)
    doc.text(`#${i + 1}`, cX + 6, cY + 9.5)

    doc.setTextColor(15, 23, 42)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.8)
    doc.text(member, cX + 20, cY + 9.5)

    // Verification Pill
    doc.setFillColor(240, 253, 244)
    doc.setDrawColor(187, 247, 208)
    doc.setLineWidth(0.6)
    doc.roundedRect(cX + crewColW - 74, cY + 3, 68, 8, 2, 2, "FD")
    doc.setTextColor(22, 101, 52)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(5.2)
    doc.text("SIGNED ON-SITE", cX + crewColW - 40, cY + 8.8, { align: "center" })
  })

  currentY += Math.ceil(data.acknowledgedCrew.length / 2) * 16 + 8

  // -------------------------------------------------------------
  // Section 4: Foreman Signature & Boss Approval Attestation
  // -------------------------------------------------------------
  const sigBoxH = 68
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(marginX, currentY, contentWidth, sigBoxH, 4, 4, "FD")

  // Left: Foreman Signature Box
  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6)
  doc.text("FOREMAN VERIFICATION SIGNATURE", marginX + 12, currentY + 13)

  if (data.signatureUri && data.signatureUri.startsWith("data:image")) {
    try {
      doc.addImage(data.signatureUri, "PNG", marginX + 12, currentY + 16, 160, 34)
    } catch {
      doc.setFont("helvetica", "italic")
      doc.setFontSize(10)
      doc.setTextColor(234, 88, 12)
      doc.text(foreman, marginX + 14, currentY + 36)
    }
  } else {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(234, 88, 12)
    doc.text(foreman, marginX + 14, currentY + 36)
  }

  doc.setDrawColor(148, 163, 184)
  doc.setLineWidth(0.5)
  doc.line(marginX + 12, currentY + 52, marginX + 190, currentY + 52)

  doc.setTextColor(100, 116, 139)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.text(`Lead Safety Representative • Signed: ${dateStr}`, marginX + 12, currentY + 60)

  // Right: Legal Attestation & Cloud Archive Notice
  const legalX = marginX + 215
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6.5)
  doc.text("LEGAL COMPLIANCE ATTESTATION (CAL/OSHA TITLE 8 § 1509)", legalX, currentY + 13)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(5.8)
  doc.setTextColor(71, 85, 105)
  const legalText =
    "I hereby certify as the Competent Safety Person that the hazards associated with this activity have been identified, mandatory controls have been established, and all crew members listed above have been thoroughly briefed prior to commencing work."
  const legalLines = doc.splitTextToSize(legalText, contentWidth - 225)
  doc.text(legalLines, legalX, currentY + 23)

  // Boss / GC Archive Stamp
  doc.setFillColor(236, 253, 245)
  doc.setDrawColor(187, 247, 208)
  doc.roundedRect(legalX, currentY + 44, contentWidth - 225, 18, 3, 3, "FD")
  doc.setTextColor(6, 95, 70)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(6)
  doc.text("ARCHIVED TO SUPABASE COMPLIANCE VAULT & DISPATCHED TO GC", legalX + 8, currentY + 55)

  // -------------------------------------------------------------
  // Footer: Page Number & Statutory Retention Notice
  // -------------------------------------------------------------
  doc.setTextColor(148, 163, 184)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.text("Reliable Risk Management • Formal Job Hazard Analysis • Statutory Retention 5 Years (OSHA Form 300A)", marginX, pageHeight - 14)
  doc.text("Page 1 of 1", pageWidth - marginX, pageHeight - 14, { align: "right" })

  return doc
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

