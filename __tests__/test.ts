import { describe, expect, test } from '@jest/globals';
import { altitudeToSlice } from "@/app/FlightObservables"
import { from, firstValueFrom, bufferCount } from 'rxjs';
import { FlightVectorRaw } from '@/app/api/data-definition';
import { List } from 'immutable';


export const data: FlightVectorRaw[] = [
    {
        icao24: "e8027b",
        callsign: "LAN580  ",
        origin_country: "Chile",
        time_position: 1683822117,
        last_contact: 1683822117,
        longitude: -79.0962,
        latitude: -8.1489,
        baro_altitude: 12184.34,
        on_ground: false,
        velocity: 230.61,
        true_track: 345,
        vertical_rate: 0,
        sensors: null,
        geo_altitude: null,
        squawk: null,
        spi: false,
        position_source: 0,
    },
    {
        icao24: "a3a555",
        callsign: "N334GV  ",
        origin_country: "United States",
        time_position: 1683822253,
        last_contact: 1683822253,
        longitude: -104.8251,
        latitude: 39.236,
        baro_altitude: 3680.46,
        on_ground: false,
        velocity: 150.16,
        true_track: 257.54,
        vertical_rate: 0.33,
        sensors: null,
        geo_altitude: null,
        squawk: null,
        spi: false,
        position_source: 0,
    },
]


describe('observables', () => {
    const obs = from(data)
    test('async test', async () => {
        const flightOne = await firstValueFrom(obs)
        expect(flightOne.callsign).toBe("LAN580  ");
    })

    test('altitudeToSlice', () => {
        expect(altitudeToSlice(12000)).toBe(12)
    })

    test('altitudeToSliceFloating', () => {
        expect(altitudeToSlice(12123.156)).toBe(12)
    })

    test('list buffer',() => {
        const buf = List([1,2,3,4,5,6])
        expect(buf.remove(0).push(7)).toStrictEqual(List([2,3,4,5,6,7]))
    })

    test('buffer windows', done => {
        let index = 0
        const results = [
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
            [4, 5, 6]
        ]
        from([1, 2, 3, 4, 5, 6])
            .pipe(
                bufferCount(3, 1)
            ).subscribe(m => {
                if (index <= 3) {
                    expect(m).toEqual(results[index])
                    index++
                    if (index == 3) {
                        done()
                        index++
                    }
                }
            })
    })
});