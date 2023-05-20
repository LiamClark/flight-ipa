import { assert, object, number, string, array, Infer, nullable, boolean } from 'superstruct'

export type GeoLocationRequest = Infer<typeof GeoLocationRequestSchema>

export const GeoLocationRequestSchema = object({
    callsign: string(),
    longitude: number(),
    latitude: number(),
})



export type GeoLocationRequests = Infer<typeof GeoLocationRequestsSchema>
export const GeoLocationRequestsSchema = object({
    flights: array(GeoLocationRequestSchema)
})

export type GeoLocationResponse = Infer<typeof GeoLocationResponseSchema>

export const GeoLocationResponseSchema = object({
    callsign: string(),
    inNetherlands: boolean()
})

export type GeoLocationResponses = Infer<typeof GeoLocationResponsesSchema>
export const GeoLocationResponsesSchema = object({
    flights: array(GeoLocationResponseSchema)
})


export type FlightVectorRaw = Infer<typeof FlightVectorRawSchema>

export const FlightVectorRawSchema = object({
    icao24: string(),
    callsign: string(),
    origin_country: string(),
    time_position: nullable(number()),
    last_contact: number(),
    longitude: nullable(number()),
    latitude: nullable(number()),
    baro_altitude: nullable(number()),
    on_ground: boolean(),
    velocity: nullable(number()),
    true_track: number(),
    //Vertical rate in m/s. ,
    vertical_rate: nullable(number()),
    sensors: nullable(array(number())),
    geo_altitude: nullable(number()),
    squawk: nullable(string()),
    spi: boolean(),
    position_source: number()
})

export type FlightVector = Infer<typeof FlightVectorSchema>

export const FlightVectorSchema = object({
    icao24: string(),
    callsign: string(),
    origin_country: string(),
    time_position: number(),
    last_contact: number(),
    longitude: number(),
    latitude: number(),
    baro_altitude: number(),
    on_ground: boolean(),
    velocity: nullable(number()),
    true_track: number(),
    //Vertical rate in m/s. ,
    vertical_rate: number(),
    sensors: nullable(array(number())),
    geo_altitude: nullable(number()),
    squawk: nullable(string()),
    spi: boolean(),
    position_source: number()
})