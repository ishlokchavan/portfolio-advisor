export function parseDocument(text: string) {

    // normalize spacing
    text = text
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")

    const project = extractProject(text)
    const unit = extractUnit(text)
    const purchase_price = extractPrice(text)

    const milestones = extractSchedule(text)

    const expected_handover = inferHandoverDate(milestones)

    // apply handover date to final milestone if missing
    milestones.forEach(m => {
        if (!m.due_date && m.milestone.toLowerCase().includes("final"))
            m.due_date = expected_handover
    })

    const payment_plan_type =
        purchase_price
            ? detectPaymentPlan(milestones, purchase_price)
            : null

    return {
        project_name: project,
        developer: detectDeveloper(text),
        unit_number: unit,
        purchase_price,
        payment_plan_type,
        expected_handover,
        milestones
    }

}


/* ---------------- PROJECT ---------------- */

function extractProject(text: string) {

    const patterns = [
        /Project\s*[:\-]?\s*([A-Z0-9]+)(?=\s+(Unit|Property|Total|Price|AED))/i,
        /Property\s*[:\-]?\s*([A-Z0-9]+)/i,
        /Development\s*[:\-]?\s*([A-Z0-9]+)/i
    ]

    for (const p of patterns) {
        const match = text.match(p)
        if (match) return match[1].trim()
    }

    return null
}


/* ---------------- UNIT ---------------- */

function extractUnit(text: string) {

    // Most reliable patterns first
    const patterns = [
        /Unit\s*(?:No\.?|Number|#)?\s*[:\-]?\s*(LAR-[A-Z0-9]+)/i,
        /Unit\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z]{2,}-\d{2,})/i,
        /Unit\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z]\d{3,})/i
    ]

    for (const p of patterns) {
        const match = text.match(p)
        if (match) return match[1]
    }

    // fallback patterns for common Dubai formats
    const fallbackPatterns = [
        /\b[A-Z]{3}-[A-Z0-9]{3,}\b/,
        /\b[A-Z]{2,}-\d{2,}\b/
    ]

    for (const p of fallbackPatterns) {
        const match = text.match(p)
        if (match) return match[0]
    }

    return null
}

/* ---------------- PRICE ---------------- */

function extractPrice(text: string): number | null {

    const patterns = [
        /Unit Price\s*AED\s*([\d,]+)/i,
        /Selling Price\s*AED\s*([\d,]+)/i,
        /Purchase Price\s*AED\s*([\d,]+)/i,
        /Total Price\s*AED\s*([\d,]+)/i,
        /Price\s*AED\s*([\d,]+)/i
    ]

    for (const p of patterns) {
        const match = text.match(p)
        if (match)
            return Number(match[1].replace(/,/g, ""))
    }

    // fallback: detect large AED numbers
    const fallback = text.match(/\b\d{1,3}(?:,\d{3}){2,}\b/)
    if (fallback)
        return Number(fallback[0].replace(/,/g, ""))

    return null
}


/* ---------------- PAYMENT SCHEDULE ---------------- */

function extractSchedule(text: string) {

    const rows: any[] = []

    const scheduleSection =
        text.split("Payments Schedule")[1]?.split("Transactions")[0] ?? text

    const regex =
        /(Down Payment|\d+(?:st|nd|rd|th) Installment|Final Installment)\s+(\d{2}-[A-Za-z]{3}-\s?\d{4})?.*?VAT\s+\d+%\s+([\d,]+(?:\.\d{2})?)/g

    let match

    while ((match = regex.exec(scheduleSection)) !== null) {

        rows.push({
            milestone: match[1].trim(),
            due_date: formatDate(match[2]),
            amount: Math.round(Number(match[3].replace(/,/g, "")))
        })

    }

    // sort chronologically
    rows.sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return a.due_date.localeCompare(b.due_date)
    })

    return rows
}


/* ---------------- PAYMENT PLAN ---------------- */

function detectPaymentPlan(milestones: any[], purchasePrice: number) {

    if (!purchasePrice || milestones.length === 0) return null

    const final = milestones[milestones.length - 1]

    const finalPct =
        Math.round((final.amount / purchasePrice) * 100)

    const beforePct = 100 - finalPct

    return `${beforePct}/${finalPct}`
}


/* ---------------- HANDOVER DATE ---------------- */

function inferHandoverDate(milestones: any[]) {

    const dated = milestones
        .filter(m => m.due_date)
        .map(m => new Date(m.due_date))

    if (dated.length === 0) return null

    const last = new Date(Math.max(...dated.map(d => d.getTime())))

    last.setMonth(last.getMonth() + 6)

    return last.toISOString().slice(0, 10)
}


/* ---------------- DEVELOPER ---------------- */

function detectDeveloper(text: string) {

    if (/emaar/i.test(text)) return "Emaar"
    if (/damac/i.test(text)) return "Damac"
    if (/sobha/i.test(text)) return "Sobha"
    if (/nakheel/i.test(text)) return "Nakheel"
    if (/binghatti/i.test(text)) return "Binghatti"
    if (/arada/i.test(text)) return "Arada"
    if (/danube/i.test(text)) return "Danube"

    return null
}


/* ---------------- DATE FORMAT ---------------- */

function formatDate(d?: string) {

    if (!d) return null

    d = d.replace(/\s+/g, "")

    const [day, mon, year] = d.split("-")

    const map: any = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04",
        May: "05", Jun: "06", Jul: "07", Aug: "08",
        Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    }

    if (!day || !mon || !year) return null

    return `${year}-${map[mon]}-${day}`
}