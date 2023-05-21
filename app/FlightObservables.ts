import { List, Map, Seq, Set } from 'immutable';
import { Observable, OperatorFunction, defer, from, map, mergeMap, of, scan, skip, timer } from 'rxjs';
import { Config } from './Config';
import { is, assert } from 'superstruct'
import { FlightVector, FlightVectorRaw, FlightVectorRawSchema, GeoLocationRequest, GeoLocationResponse, GeoLocationResponsesSchema } from './api/data-definition';

function fromJsonArray(json: any): FlightVectorRaw {
    const rawFlightData = {
        icao24: json[0],
        callsign: json[1],
        origin_country: json[2],
        time_position: json[3],
        last_contact: json[4],
        longitude: json[5],
        latitude: json[6],
        baro_altitude: json[7],
        on_ground: json[8],
        velocity: json[9],
        true_track: json[10],

        //Vertical rate in m/s. 
        vertical_rate: json[11],
        sensors: json[12],
        geo_altitude: json[13],
        squawk: json[14],
        spi: json[15],
        position_source: json[16],
    }

    return rawFlightData
}

export function loadData(config: Config): Observable<FlightVectorRaw[]> {
    const fetchApiData = defer(() => {
        const url = config.testing ? "http://localhost:3000/flight.json" : "https://opensky-network.org/api/states/all"
        const promise = fetch(url)
            .then(r => r.json())
            .then(json => {
                const flights: any[] = json.states.map(fromJsonArray);
                const validatedFlights = flights.filter((v): v is FlightVectorRaw => {
                    return is(v, FlightVectorRawSchema);
                });
                return validatedFlights
            })

        return from(promise)
    })

    return timer(0, config.pollingInterval())
        .pipe(mergeMap(_ => fetchApiData))
}

function groupCountries(xs: FlightVectorRaw[]): Map<string, number> {
    const map = Seq(xs).groupBy(s => s.origin_country)
    const rest: Map<string, number> = map.mapEntries(([k, v]) => [k, v.size ?? 0])
    return rest
}

type OriginState = [Map<string, number>, Set<String>]

export function scanOccurenceMap(): OperatorFunction<FlightVectorRaw[], OriginState> {
    const flightCountsSeed: Map<string, number> = Map()
    const knownFlightsSeed: Set<string> = Set()

    return scan(([flightCounts, knownFlights], fs) => {
        const newFlights = fs.filter(fs => !knownFlights.has(fs.callsign))
        const newFlightCounts = flightCounts.mergeWith((a, b) => a + b, groupCountries(newFlights))
        const newKnownFlights = newFlights.reduce((a, b) => a.add(b.callsign), knownFlights)

        return [newFlightCounts, newKnownFlights]
    }, [flightCountsSeed, knownFlightsSeed])

}

export function geoFilter(config: Config, fs: FlightVector[]): Observable<FlightVector[]> {
    if (fs.length == 0) {
        return of([])
    }
    const requests: GeoLocationRequest[] = fs.map(f => ({ callsign: f.callsign, longitude: f.longitude, latitude: f.latitude }))
    return defer(() =>
        from(
            fetch(config.geoFilterUrl, {
                method: "POST",
                body: JSON.stringify({ flights: requests })
            }).then(r => r.json())
                .then(r => {
                    assert(r, GeoLocationResponsesSchema)
                    return r
                })
        ).pipe(
            map(res => filterZip(fs, res.flights))
        )
    )
}

function filterZip(fs: FlightVector[], resps: GeoLocationResponse[]): FlightVector[] {
    if (fs.length != resps.length) {
        throw new Error("request and response arrays differ in length")
    }
    const newFs: FlightVector[] = []
    for (let i = 0; i < fs.length; i++) {
        const f = fs[i]
        const r = resps[i]
        if (f.callsign != r.callsign) {
            throw new Error("Api changed the order of requests")
        }
        if (r.inNetherlands) {
            newFs.push(f)
        }
    }

    return newFs
}

export function slidingWindows<X>(size: number): OperatorFunction<X, List<X>> {
    const seed: List<X> = List()
    return scan((acc, x) => {
        if (acc.size == size) {
            return acc.remove(0).push(x)
        } else {
            return acc.push(x)
        }
    }, seed)
}

export function flightsInSlices(xs: FlightVector[]): Map<number, FlightVector[]> {
    return Seq(xs)
        .groupBy(f => altitudeToSlice(f.baro_altitude))
        .map(s => s.toArray())
}

export function hasWarning(config: Config, altitudeSlice: number, f: FlightVector): boolean {
    const secondsUntilNextPoll = config.pollingInterval() / 1000
    if (f.baro_altitude) {
        const expectedAltitude = f.baro_altitude + (f.vertical_rate * secondsUntilNextPoll)
        return expectedAltitude < altitudeSlice * 1000 || expectedAltitude > (altitudeSlice + 1) * 1000
    } else {
        return false
    }
}

export function altitudeToSlice(altitude: number) {
    return Math.floor(altitude / 1000)
}

export type DiffState = {
    all: Set<string>
    newItems: Set<string>
    removed: Set<string>
}

export function newOld(xs: Observable<FlightVector[]>): Observable<DiffState> {
    const seed: DiffState = {
        all: Set(),
        newItems: Set(),
        removed: Set()
    }
    return xs.pipe(
        map(xs => Set(xs.map(x => x.callsign))),
        scan((acc, xs) => {
            const all = acc.all
            const newItems = xs.subtract(all)
            const removed = all.subtract(xs)

            return { all: xs, newItems: newItems, removed: removed }
        }, seed),
        // This removes the first entry where every flight is considered "new"
        // I'd rather use the overload of scan to take the first value from the emission as a seed
        // However pattern matching on a value of type Set<string> | DiffState is nasty.
        skip(1)
    )
}