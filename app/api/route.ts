import { NextResponse } from 'next/server';
import { inNetherlands } from './geo-location';
import { assert } from 'superstruct';
import { GeoLocationRequestsSchema } from './data-definition';

export async function POST(request: Request) {
    const json = await request.json()
    assert(json, GeoLocationRequestsSchema)

    const located = json.flights.map(m => {
        return {
            callsign: m.callsign,
            inNetherlands: inNetherlands(m)
        }
    })
    return NextResponse.json({ flights: located })
}
