import { List, Map, Seq } from 'immutable';
import { EMPTY, Observable, OperatorFunction, count, defer, filter, from, map, mergeMap, of, scan, timer } from 'rxjs';
import { Config, convertToHourlyRate } from './Config';
import { is, assert } from 'superstruct'
import { dateFromTimeStamp } from './TimeWindows';
import { FlightVector, FlightVectorRaw, FlightVectorRawSchema, GeoLocationRequest, GeoLocationRequestsSchema, GeoLocationResponse, GeoLocationResponsesSchema } from './api/data-definition';

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
                    // assert(v, FlightVectorRawSchema)
                    return is(v, FlightVectorRawSchema);
                });
                return validatedFlights
            })

        return from(promise)
    })


    // This does a conversion from any to FlightVector[]
    // can I add validation to this?
    return timer(0, config.pollingInterval)
        .pipe(mergeMap(_ => fetchApiData))
}

export function topCountries(data: Observable<FlightVectorRaw[]>): Observable<string[]> {
    return data.pipe(
        map(topThreeCountries)
    )
}

//optimize this operation
function topThreeCountries(xs: FlightVectorRaw[]): string[] {
    const map = Seq(xs).groupBy(s => s.origin_country)
    const seq = map.mapEntries(([k, v]) => [k, v.size ?? 0])
        .toKeyedSeq()

    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
        .map(([s, _]) => s)
}

function groupCountries(xs: FlightVectorRaw[]): Map<string, number> {
    const map = Seq(xs).groupBy(s => s.origin_country)
    const rest: Map<string, number> = map.mapEntries(([k, v]) => [k, v.size ?? 0])
    return rest
}

//This implementation is still faulty.
// Because it will count flights I have seen before.
export function scanOccurenceMap(): OperatorFunction<FlightVectorRaw[], Map<string, number>> {
    const seed: Map<string, number> = Map()
    return scan((acc, v) => {
        return acc.mergeWith((a, b) => a + b, groupCountries(v))
    }, seed)

}

//Oke time to redesign this, I will make it work with the api in batch mode
export function flightsPerHour(
    config: Config,
    xs: FlightVector[],
    geoFilter: (fs: FlightVector[]) => Observable<FlightVector[]>
): Observable<Number> {
    return geoFilter(xs).pipe(
        map(xs => xs.length),
        map(c => convertToHourlyRate(config, c))
    )
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
                    try {
                        assert(r, GeoLocationResponsesSchema)
                    } catch (e: any) {
                        debugger
                    }
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

function flightsInSlices(xs: FlightVector[]) {
    return List(xs)
        //put unkown flights in a negative bucket
        .groupBy(f => altitudeToSlice(f.baro_altitude ?? -1))
        //remove that bucket
        .delete(-1)
}

function hasWarning(config: Config, altitudeSlice: number, f: FlightVector): boolean {
    const secondsUntilNextPoll = config.pollingInterval / 1000
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


// // First lets do the amount of flights in an hour.
// function flightsPerHour(xs: FlightVector[], state: FlightsPerHourState) {
//     const dates: [FlightVector, Date][] = xs.map(x => [x, dateFromTimeStamp(x.time_position)])
//     //TODO: If we roll into a new day reset the state. 
//     const newState = anyMatch(dates, ([_, d]) => d.getDate() != new Date().getDate()) ? state : state

//     // Here I want to remove flights we already have recorded for the current hour.
//     const flightsToLocate = dates.filter(([f, d]) => { 
//         const callSigns = newState.flights.get(d.getHours())
//         if (callSigns) {
//             //we flip because we are interested in new flights!
//            return !callSigns.has(f.callsign) 

//         } else {
//             const set: Set<string> = new Set(f.callsign)
//             newState.flights.set(d.getHours(), set)
//             //if we have no flights for this this needs to go through therefor we return true
//             return true;
//         }
//     })

//     from(flightsToLocate).pipe(
//         //filter to flights only above the netherlands
//         mergeMap(([f,d]) => filterGeoLocation(f)))

//     )

// }

// function anyMatch<A>(xs: A[], f: (x: A) => boolean) {
//     for (let x of xs) {
//         if (f(x)) {
//             return true;
//         }
//     }
//     return false;
// }

//if I want to show buckets of hours I need to know which hour already knows about which flights a.k.a. 
interface FlightsPerHourState {
    //the date for which this bucket holds
    date: Date

    //a map of an hour with a set of all the callsigns already reported in that hour.
    flights: Map<number, Set<string>>
}

interface Position {
    latitude: number
    longitude: number
}

