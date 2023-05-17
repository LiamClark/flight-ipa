import { findCountryByCoordinate } from "country-locator"

export interface GeoLocationRequest {
    callsign: string
    longitude: number
    latitude: number
}

export function inNetherlands(r: GeoLocationRequest): boolean {
    return (findCountryByCoordinate(r.longitude, r.latitude)?.code ?? "") === "NLD"
}

export function convertJson(json: any): GeoLocationRequest[] {
    return json
}