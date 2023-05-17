import { GeoLocationRequest, findNameOf } from '@/app/api/route';
import { describe, expect, test } from '@jest/globals';


describe("country lookup", () => {
    test('A point in netherlands', () => {
        const request: GeoLocationRequest = {
            callsign: "",
            longitude: 4.372115,
            latitude: 51.995825
        }
        expect(findNameOf(request)).toBe("NL")
    })
})