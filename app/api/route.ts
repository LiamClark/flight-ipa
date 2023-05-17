import { NextResponse } from 'next/server';
import { GeoLocationRequest, inNetherlands } from './logic';

//ok so this is the component to do reverse geo location
// I've gotten a package for this, I know I want to do this on the server
// To avoid shipping the geoJSON to the client
// To introduce some extra asynchrony
// Now what should the json for this look like?
// I just want to send callsigns and lat, longitudes

export async function GET() {
    return NextResponse.json({ hi: "hello" })
}

/* 
test data:
    [
        {
            "callsign": "NLD",
            "longitude": 51.995825,
            "latitude": 4.372115
        },
        {
            "callsign": "ENG",
            "longitude": 51.500760,
            "latitude": -0.125168
        }
    ]

*/
export async function POST(request: Request) {
    const json = await request.json()
    const requests: [GeoLocationRequest] = json


    const located = requests.map(m => {
        return {
            callsign: m.callsign,
            inNetherlands: inNetherlands(m)
            // inNetherlands: true
        }
    })


    // return NextResponse.json({ hi: "hello" })
    return NextResponse.json({ flights: located })
}