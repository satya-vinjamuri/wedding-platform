// /app/api/rsvp/lookup/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const sheetId = req.nextUrl.searchParams.get('sheetId');
    const googleScriptUrl = `https://script.google.com/macros/s/AKfycbyBCO4ZfeL0StEecuR0UnlT8YCos5fT1Nh_swoKqH57sMn9-NmFIFl2hMKrobdw1jv5/exec?sheetId=${sheetId}`;

    try {
        const res = await fetch(googleScriptUrl);
        console.log(res);
        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch guest list' }, { status: 500 });
    }
}
