import { GeoLocationRequest, inNetherlands } from '@/app/api/logic';
import { describe, expect, test } from '@jest/globals';
import { findCountryByCoordinate } from 'country-locator';


describe("country lookup", () => {
    test('A point in Netherlands', () => {
        const request: GeoLocationRequest = {
            callsign: "",
            longitude: 51.995825,
            latitude: 4.372115
        }

        expect(inNetherlands(request)).toBe(true)
    })

    test(' A point outside the Netherlands', () => {
        const request: GeoLocationRequest = {
            callsign: "",
            longitude: 51.500760,
            latitude: -0.125168
        }

        expect(inNetherlands(request)).toBe(false)
    })
})