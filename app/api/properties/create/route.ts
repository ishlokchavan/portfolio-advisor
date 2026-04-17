import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

    try {

        const body = await req.json()

        const {
            project_name,
            developer,
            unit_number,
            purchase_price,
            payment_plan_type,
            expected_handover,
            milestones
        } = body

        // 1️⃣ create property
        const { data: property, error } = await supabase
            .from("properties")
            .insert({
                project_name,
                developer,
                unit_number,
                purchase_price,
                payment_plan_type,
                expected_handover
            })
            .select()
            .single()

        if (error) throw error

        // 2️⃣ create payment schedule
        if (milestones?.length) {

            const scheduleRows = milestones.map((m: any) => ({
                milestone: m.milestone,
                due_date: m.due_date,
                amount: m.amount,
                property_id: property.id,
                status: "upcoming"
            }))

            const { error: scheduleError } = await supabase
                .from("payment_schedules")
                .insert(scheduleRows)

            if (scheduleError) throw scheduleError

        }

        return NextResponse.json(property)

    } catch (e: any) {

        console.error(e)

        return NextResponse.json(
            { error: e.message },
            { status: 500 }
        )

    }

}