// /app/api/rsvp/submit/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();

    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyBCO4ZfeL0StEecuR0UnlT8YCos5fT1Nh_swoKqH57sMn9-NmFIFl2hMKrobdw1jv5/exec';

    try {
        const res = await fetch(googleScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const result = await res.text(); // or .json() if you return JSON from Apps Script
        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
    }
}
