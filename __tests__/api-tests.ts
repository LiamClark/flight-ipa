
import { GeoLocationRequest, GeoLocationRequestSchema } from "@/app/api/data-definition";
import { inNetherlands } from '@/app/api/logic';
import { describe, expect, test } from '@jest/globals';
import { assert } from 'superstruct';





describe("country lookup", () => {
    test("A location request with complete data", () => {
        const request = {
            callsign: "",
            latitude: 51.995825,
            longitude: 4.372115
        }

        assert(request, GeoLocationRequestSchema)
    })

    test("A location request with incomplete data", () => {
        const request = {
            callsign: "",
            latitude: null,
            longitude: 4.372115
        }

       expect(() => assert(request, GeoLocationRequestSchema)).toThrow()
    })

    test("A location request for WZZ5183", () => {
        const request: GeoLocationRequest = {
            callsign: "WZZ5183",
            latitude: 52.6138,
            longitude: 6.1576
        }

        expect(inNetherlands(request)).toBe(true)
    })

    test('A point in Netherlands', () => {
        const request: GeoLocationRequest = {
            callsign: "",
            latitude: 51.995825,
            longitude: 4.372115
        }

        expect(inNetherlands(request)).toBe(true)
    })

    test(' A point outside the Netherlands', () => {
        const request: GeoLocationRequest = {
            callsign: "",
            latitude: 51.500760,
            longitude: -0.125168
        }

        expect(inNetherlands(request)).toBe(false)
    })
})