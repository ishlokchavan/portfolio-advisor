import { NextResponse } from "next/server"
import { parseDocument } from "@/lib/parser"

export const runtime = "nodejs"
export const maxDuration = 60

async function extractPdfText(buffer: Buffer): Promise<string> {

    const PDFParser = (await import("pdf2json")).default

    return new Promise((resolve, reject) => {

        const pdfParser = new PDFParser()

        pdfParser.on("pdfParser_dataError", err => {
            reject(err)
        })

        pdfParser.on("pdfParser_dataReady", pdfData => {

            let text = ""

            for (const page of pdfData.Pages) {

                for (const textItem of page.Texts) {

                    let str = textItem.R?.[0]?.T ?? ""

                    try {
                        str = decodeURIComponent(str)
                    } catch {
                        // ignore malformed encoding
                    }

                    text += str + " "

                }

            }

            resolve(text)

        })

        pdfParser.parseBuffer(buffer)

    })

}

export async function POST(req: Request) {

    try {

        const { media_type, data } = await req.json()

        if (!data || !media_type) {
            return NextResponse.json(
                { error: "Missing file" },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(data, "base64")

        if (buffer.length > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File too large (max 10MB)" },
                { status: 400 }
            )
        }

        let text = ""

        if (media_type.includes("pdf")) {

            text = await extractPdfText(buffer)

        } else {

            return NextResponse.json(
                { error: "Only PDF files supported currently" },
                { status: 400 }
            )

        }

        // normalize text
        text = text
            .replace(/\r/g, " ")
            .replace(/\n/g, " ")
            .replace(/\s+/g, " ")
            .trim()

        text = text
            .replace(/AED/g, " AED ")
            .replace(/Installment/g, " Installment ")

        const parsed = parseDocument(text)

        return NextResponse.json(parsed)

    } catch (e: any) {

        console.error("Extraction error:", e)

        return NextResponse.json(
            { error: "Extraction failed" },
            { status: 500 }
        )

    }

}