import { Seq } from 'immutable';
import { Observable, filter, from, map, scan } from 'rxjs';

export interface FlightVector {
    icao24: string
    callsign: string
    origin_country: string
    time_position: number
    last_contact: number
    longitude?: number
    latitude?: number
    baro_altitude?: number
    on_ground: boolean
    velocity?: number
    true_track: number
    vertical_rate: number
    sensors?: number[]
    geo_altitude?: number
    squawk?: string
    spi: boolean
    position_source: number
}

export function lift(data: FlightVector[]): Observable<FlightVector> {
    return from(data)
}

export function topCountry(data: Observable<FlightVector>): Observable<string> {
    const seed: Map<string, number> = new Map()
    return data.pipe(
        scan((acc, v) => {
            const entry = acc.get(v.origin_country);
            const newCount = entry ? entry + 1 : 1;

            return acc.set(v.origin_country, newCount);
        }, seed),
        map(m => Seq(m.entries()).maxBy(([, count]) => count)?.[0]),
        filter((s): s is string => !!s)
    );
}