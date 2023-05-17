import { NextResponse } from 'next/server';
import {findCountryByCoordinate} from "country-locator";


//ok so this is the component to do reverse geo location
// I've gotten a package for this, I know I want to do this on the server
// To avoid shipping the geoJSON to the client
// To introduce some extra asynchrony
// Now what should the json for this look like?
// I just want to send callsigns and lat, longitudes

export async function POST(request: Request) {
    const json =  await request.json()
    const requests = convertJson(json)

    // requests
    // .map(r => findCountryByCoordinate(r.longitude, r.latitude)) 
    // .map(c => c?.name)


    return NextResponse.json({hi: "hello"})
}

export interface GeoLocationRequest {
    callsign: string
    longitude: number
    latitude: number
}

export function findNameOf(r: GeoLocationRequest) {
    return findCountryByCoordinate(r.longitude, r.latitude) 
}

function convertJson(json: any): GeoLocationRequest[] {
    return json
}