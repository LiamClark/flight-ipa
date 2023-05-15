import { describe, expect, test } from '@jest/globals';
import {lift , FlightVector } from "../app/Batch"
import { TestScheduler } from 'rxjs/testing';
import { Observable, firstValueFrom } from 'rxjs';


export const data: FlightVector[] = [
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
        spi: false,
        position_source: 0,
    },
]



describe('sum module', () => {
    const obs = lift(data)
        test('adds 1 + 2 to equal 3', async () => {
            const flightOne = await firstValueFrom(obs) 
            expect(flightOne.callsign).toBe("LAN580  ");
        });
});