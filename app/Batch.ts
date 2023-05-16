import { Seq } from 'immutable';
import { EMPTY, Observable, count, defer, filter, from, interval, map, mergeMap, of, repeat, scan } from 'rxjs';
import { Config, convertToHourlyRate } from './Config';
import { dateFromTimeStamp } from './TimeWindows';
import { date } from 'superstruct';

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

function loadData(config: Config): Observable<FlightVector[]> {
    const fetchApiData = defer(() => {
        const url = config.testing ? "http://localhost:3000/flight.json" : "https://opensky-network.org/api/states/all"
        const promise = fetch(url)
            .then(r => r.json())

        return from(promise)
    })


    // This does a conversion from any to FlightVector[]
    // can I add validation to this?
    return interval(config.pollingInterval)
        .pipe(mergeMap(_ => fetchApiData))
}

export function lift(data: FlightVector[]): Observable<FlightVector> {
    return from(data)
}

export function topCountry(data: Observable<FlightVector[]>): Observable<string[]> {
    return data.pipe(
        map(topThreeCountries)
    )
}

//optimize this operation
function topThreeCountries(xs: FlightVector[]): string[] {
    const map = Seq(xs).groupBy(s => s.origin_country)
    const seq = map.mapEntries(([k, v]) => [k, v.size ?? 0])
        .toKeyedSeq()

    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
        .map(([s, _]) => s)

}

function flightsPerHour(config: Config, xs: FlightVector[]): Observable<Number> {
    return from(xs).pipe(
        mergeMap(filterGeoLocation),
        count(),
        map(c => convertToHourlyRate(config, c))
    )
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

function filterGeoLocation(f: FlightVector): Observable<FlightVector> {
    if (f.latitude && f.longitude) {
        const position = {
            latitude: f.latitude,
            longitude: f.longitude
        }

        return mockGeoLocation(position)
            .pipe(
                filter(b => b),
                map(_ => f)
            )
    }

    return EMPTY
}

// I can have a source observable for this but that does not help with state
// across invocations to the function. A.k.a. the boundary of the randomness is not in this function
// for today let's just put in a random value which I hope doesn't cause problems with the runtime 
function mockGeoLocation(p: Position): Observable<boolean> {
    return of(Math.random() < 0.5)
}