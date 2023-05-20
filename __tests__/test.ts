import { describe, expect, test } from '@jest/globals';
import { altitudeToSlice } from "@/app/Batch"
import { TestScheduler } from 'rxjs/testing';
import { from , firstValueFrom } from 'rxjs';
import { FlightVectorRaw } from '@/app/api/data-definition';



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



describe('batch mode', () => {
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


});