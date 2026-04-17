export function parseDocument(text: string) {

    const project =
        text.match(/Project\s+([A-Z]+)/i)?.[1] ?? null

    const unit =
        text.match(/Unit\s+([A-Z0-9\-]+)/i)?.[1] ?? null

    const priceMatch =
        text.match(/Unit Price\s+AED\s+([\d,]+)/i)

    const purchase_price =
        priceMatch ? Number(priceMatch[1].replace(/,/g, "")) : null

    const milestones = extractSchedule(text)

    return {
        project_name: project,
        developer: detectDeveloper(text),
        unit_number: unit,
        purchase_price,
        payment_plan_type: null,
        expected_handover: null,
        milestones
    }

}

function extractSchedule(text: string) {

    const rows = []

    const regex =
        /([A-Za-z0-9\s]+Installment|Down Payment|Final Installment)\s+(\d{2}-[A-Za-z]{3}-\d{4})?\s+\d+\.\d+\s+VAT\s+\d+%\s+([\d,]+\.\d+)/g

    let match

    while ((match = regex.exec(text)) !== null) {

        rows.push({
            milestone: match[1].trim(),
            due_date: formatDate(match[2]),
            amount: Number(match[3].replace(/,/g, ""))
        })

    }

    return rows

}

function detectDeveloper(text: string) {

    if (/emaar/i.test(text)) return "Emaar"
    if (/damac/i.test(text)) return "Damac"
    if (/sobha/i.test(text)) return "Sobha"
    if (/nakheel/i.test(text)) return "Nakheel"
    if (/binghatti/i.test(text)) return "Binghatti"

    return null

}

function formatDate(d?: string) {

    if (!d) return null

    const [day, mon, year] = d.split("-")

    const map: any = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04",
        May: "05", Jun: "06", Jul: "07", Aug: "08",
        Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    }

    return `${year}-${map[mon]}-${day}`

}