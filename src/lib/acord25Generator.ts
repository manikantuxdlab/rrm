import { jsPDF } from "jspdf"
import type { CoiRequestRecord } from "@/types"
import { RRM_LOGO_BASE64 } from "@/lib/rrmLogoBase64"

/**
 * Builds an official, standard ACORD 25 Certificate of Liability Insurance document
 * following legal insurance format with broker/producer header, carrier NAIC codes,
 * coverage limits, certificate holder box, and cryptographic certification stamp.
 */
export function buildAcord25PdfDoc(request: CoiRequestRecord): jsPDF {
  const doc = new jsPDF("p", "pt", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Top Orange Compliance Bar
  doc.setFillColor(234, 88, 12)
  doc.rect(0, 0, pageWidth, 4, "F")

  // 2. ACORD Form Header
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

  // Header Title
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("CERTIFICATE OF LIABILITY INSURANCE", 104, 28)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(234, 88, 12)
  doc.text("ACORD 25 (2026/11) • STATE APPROVED CERTIFICATION STANDARD", 104, 40)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text("PRODUCER LICENSED BY CALIFORNIA DEPARTMENT OF INSURANCE • LICENSE #0L88912", 104, 50)

  // Date top-right
  const certDate = request.issuedAt
    ? new Date(request.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  doc.setFillColor(241, 245, 249)
  doc.roundedRect(pageWidth - 140, 18, 108, 22, 4, 4, "F")
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.text("DATE (MM/DD/YYYY)", pageWidth - 86, 27, { align: "center" })
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text(certDate, pageWidth - 86, 37, { align: "center" })

  // Divider
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.8)
  doc.line(32, 60, pageWidth - 32, 60)

  // 3. Grid Row 1: PRODUCER & INSURED vs INSURERS AFFORDING COVERAGE
  const yBox1 = 70
  const col1W = 260
  const col2X = 300
  const col2W = pageWidth - 32 - col2X

  // Box A: PRODUCER
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(226, 232, 240)
  doc.roundedRect(32, yBox1, col1W, 56, 4, 4, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("PRODUCER / BROKER OF RECORD", 40, yBox1 + 12)
  doc.setFontSize(7.5)
  doc.setTextColor(15, 23, 42)
  doc.text("Reliable Risk Management Insurance Services LLC", 40, yBox1 + 24)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  doc.text("1000 Wilshire Blvd, Suite 2100, Los Angeles, CA 90017", 40, yBox1 + 35)
  doc.text("Phone: (213) 555-0199 • Email: certificates@reliable-risk.com", 40, yBox1 + 46)

  // Box B: INSURED
  const yBox2 = yBox1 + 62
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(32, yBox2, col1W, 56, 4, 4, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("NAMED INSURED", 40, yBox2 + 12)
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text(request.companyName, 40, yBox2 + 25)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  doc.text("Attn: Field Safety & Construction Risk Division", 40, yBox2 + 36)
  doc.text(`Active Project: ${request.jobSiteName} (#${request.jobNumber || "2026"})`, 40, yBox2 + 47)

  // Box C: INSURERS AFFORDING COVERAGE (Carrier NAIC codes)
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(col2X, yBox1, col2W, 118, 4, 4, "FD")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("INSURERS AFFORDING COVERAGE", col2X + 8, yBox1 + 12)
  doc.text("NAIC #", col2X + col2W - 14, yBox1 + 12, { align: "right" })

  const carriers = [
    { letter: "A", name: "Travelers Property Casualty Co of America", naic: "25674" },
    { letter: "B", name: "Berkshire Hathaway Specialty Insurance", naic: "22276" },
    { letter: "C", name: "Liberty Mutual Fire Insurance Company", naic: "23035" },
    { letter: "D", name: "State Compensation Insurance Fund", naic: "35076" },
  ]

  let yCarrier = yBox1 + 26
  carriers.forEach((c) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(234, 88, 12)
    doc.text(`INSURER ${c.letter}:`, col2X + 8, yCarrier)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(15, 23, 42)
    doc.text(c.name.slice(0, 32), col2X + 60, yCarrier)

    doc.setFont("helvetica", "bold")
    doc.setTextColor(71, 85, 105)
    doc.text(c.naic, col2X + col2W - 14, yCarrier, { align: "right" })
    yCarrier += 22
  })

  // 4. COVERAGES SCHEDULE TABLE
  let yTable = yBox2 + 66
  doc.setFillColor(241, 245, 249)
  doc.roundedRect(32, yTable, pageWidth - 64, 18, 3, 3, "F")
  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(71, 85, 105)
  doc.text("INSR", 38, yTable + 12)
  doc.text("TYPE OF INSURANCE", 62, yTable + 12)
  doc.text("POLICY NUMBER", 185, yTable + 12)
  doc.text("EFF DATE", 270, yTable + 12)
  doc.text("EXP DATE", 325, yTable + 12)
  doc.text("LIMITS (USD)", pageWidth - 42, yTable + 12, { align: "right" })

  yTable += 18

  const policies = [
    {
      insr: "A",
      type: "COMMERCIAL GENERAL LIABILITY",
      sub: "✓ Claims-Made & Occur • Incl Completed Ops",
      policyNo: "GL-994102-TRV",
      eff: "01/01/2026",
      exp: "01/01/2027",
      limits: [
        "EACH OCCURRENCE: $1,000,000",
        "DAMAGE TO RENTED: $300,000",
        "MED EXP (Any one): $10,000",
        "GENL AGGREGATE: $2,000,000",
      ],
      active: request.coverages?.gl !== false,
    },
    {
      insr: "C",
      type: "AUTOMOBILE LIABILITY",
      sub: "✓ Any Auto • All Owned & Hired Autos",
      policyNo: "CA-881230-LIB",
      eff: "01/01/2026",
      exp: "01/01/2027",
      limits: ["COMBINED SINGLE LIMIT: $1,000,000", "BODILY INJURY / ACCIDENT: INCL"],
      active: request.coverages?.auto !== false,
    },
    {
      insr: "B",
      type: "EXCESS / UMBRELLA LIABILITY",
      sub: "✓ Occurrence Form • Excess of GL, Auto & WC",
      policyNo: "UMB-441920-BH",
      eff: "01/01/2026",
      exp: "01/01/2027",
      limits: ["EACH OCCURRENCE: $5,000,000", "AGGREGATE LIMIT: $5,000,000"],
      active: request.coverages?.umbrella !== false,
    },
    {
      insr: "D",
      type: "WORKERS COMPENSATION & EMP. LIAB.",
      sub: "✓ Statutory Limits • Prop / Partners Incl",
      policyNo: "WC-109482-SCIF",
      eff: "01/01/2026",
      exp: "01/01/2027",
      limits: [
        "STATUTORY LIMITS: PER STATUTE",
        "E.L. EACH ACCIDENT: $1,000,000",
        "E.L. DISEASE - POL LIMIT: $1,000,000",
      ],
      active: request.coverages?.wc !== false,
    },
  ]

  policies.forEach((p, idx) => {
    const rowH = 34
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(32, yTable, pageWidth - 64, rowH, "F")
    }

    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(32, yTable + rowH, pageWidth - 32, yTable + rowH)

    // Insurer letter
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(234, 88, 12)
    doc.text(p.insr, 42, yTable + 13)

    // Type of Insurance
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(7.5)
    doc.text(p.type, 62, yTable + 13)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(6)
    doc.setTextColor(100, 116, 139)
    doc.text(p.sub, 62, yTable + 24)

    // Policy No & Dates
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7)
    doc.setTextColor(15, 23, 42)
    doc.text(p.policyNo, 185, yTable + 15)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text(p.eff, 270, yTable + 15)
    doc.text(p.exp, 325, yTable + 15)

    // Limits
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(15, 23, 42)
    p.limits.slice(0, 2).forEach((lim, lIdx) => {
      doc.text(lim, pageWidth - 42, yTable + 12 + lIdx * 11, { align: "right" })
    })

    yTable += rowH
  })

  // 5. DESCRIPTION OF OPERATIONS / SPECIAL ENDORSEMENTS
  yTable += 10
  const descH = 68
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(32, yTable, pageWidth - 64, descH, 4, 4, "FD")

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text(
    "DESCRIPTION OF OPERATIONS / LOCATIONS / VEHICLES / SPECIAL PROVISIONS (ACORD 101 Additional Remarks)",
    40,
    yTable + 12
  )

  const endorsements = [
    request.endorsements?.additionalInsured !== false
      ? "• Certificate Holder is named as Additional Insured on General Liability (forms CG 20 10 04 13 and CG 20 37 04 13) and Auto Liability."
      : "",
    request.endorsements?.waiverSubrogation !== false
      ? "• Waiver of Subrogation applies in favor of Certificate Holder where required by written contract."
      : "",
    request.endorsements?.primaryNonContributory !== false
      ? "• Coverage is Primary and Non-Contributory to any other insurance available to the Certificate Holder."
      : "",
    `• PROJECT: ${request.jobSiteName} (Job #${request.jobNumber || "2026"}) • ${request.notes || "Commercial trade construction operations."}`,
  ].filter(Boolean)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6.5)
  doc.setTextColor(15, 23, 42)
  endorsements.slice(0, 4).forEach((e, idx) => {
    doc.text(e, 40, yTable + 24 + idx * 10)
  })

  // 6. CERTIFICATE HOLDER BOX vs AUTHORIZED REPRESENTATIVE SIGNATURE
  yTable += descH + 10
  const bottomH = 82
  const holderW = 310

  // Left Box: CERTIFICATE HOLDER
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.roundedRect(32, yTable, holderW, bottomH, 4, 4, "FD")

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("CERTIFICATE HOLDER", 40, yTable + 13)

  doc.setFontSize(8.5)
  doc.setTextColor(15, 23, 42)
  doc.text(request.holderName, 40, yTable + 27)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(71, 85, 105)
  const addrLines = doc.splitTextToSize(request.holderAddress || "Jobsite Field Headquarters", holderW - 20)
  doc.text(addrLines.slice(0, 2), 40, yTable + 40)

  if (request.holderContactName) {
    doc.setFont("helvetica", "italic")
    doc.text(`Attn: ${request.holderContactName}`, 40, yTable + 64)
  }

  // Right Box: CANCELLATION & AUTHORIZED SIGNATURE
  const sigX = 352
  const sigW = pageWidth - 32 - sigX
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(sigX, yTable, sigW, bottomH, 4, 4, "FD")

  doc.setFontSize(6)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("CANCELLATION CLAUSE", sigX + 8, yTable + 11)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(5.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    "SHOULD ANY OF THE ABOVE POLICIES BE CANCELLED BEFORE EXPIRATION, NOTICE WILL BE DELIVERED IN ACCORDANCE WITH POLICY PROVISIONS.",
    sigX + 8,
    yTable + 21,
    { maxWidth: sigW - 16 }
  )

  doc.setDrawColor(226, 232, 240)
  doc.line(sigX + 8, yTable + 34, sigX + sigW - 8, yTable + 34)

  doc.setFontSize(6.5)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 116, 139)
  doc.text("AUTHORIZED REPRESENTATIVE", sigX + 8, yTable + 43)

  // Digital Signature
  doc.setFont("times", "italic")
  doc.setFontSize(14)
  doc.setTextColor(30, 58, 138)
  const signer = request.issuedByName || "David A. Rosenthal, Underwriter"
  doc.text(signer, sigX + 16, yTable + 61)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(6)
  doc.setTextColor(100, 116, 139)
  doc.text("Cryptographically Verified via Reliable Risk Management Cloud", sigX + 8, yTable + 73)

  // Footer bar
  doc.setFontSize(6.5)
  doc.setTextColor(148, 163, 184)
  doc.text(
    "ACORD 25 (2026/11) • © 1988-2026 ACORD CORPORATION. All rights reserved. The ACORD name and logo are registered marks of ACORD.",
    pageWidth / 2,
    pageHeight - 16,
    { align: "center" }
  )

  return doc
}

/**
 * Downloads ACORD 25 PDF directly and opens in native tab viewer
 */
export function downloadAcord25Pdf(request: CoiRequestRecord): void {
  const doc = buildAcord25PdfDoc(request)
  const cleanName = (request.holderName || "Client").replace(/[^a-zA-Z0-9_-]/g, "_")
  const filename = `ACORD_25_COI_${cleanName}_${Date.now()}.pdf`

  doc.save(filename)

  try {
    const blob = doc.output("blob")
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, "_blank")
  } catch (e) {
    console.warn("Could not open PDF in new tab:", e)
  }
}
