import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const sheetId = url.searchParams.get('sheetId');

    const apiKey = process.env.GOOGLE_API_KEY;
    const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Wedding%20Events%20Key!A1:A1000?key=${apiKey}`
    );

    const data = await response.json();

    // Filter out empty or null rows
    const weddingEvents = (data.values || [])
        .map((row: any) => row[0]?.trim())
        .filter((val: string | undefined) => !!val);

    return NextResponse.json({ WeddingEvents: weddingEvents }, { status: 200 });
}

