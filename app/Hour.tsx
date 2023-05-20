'use client'

import { Card } from "react-bootstrap"
import { flightsPerHour, geoFilter } from "./Batch"
import { Observable, map, mergeMap } from "rxjs"
import { useEffect, useState } from "react"
import { Config } from "./Config"
import { FlightVector, FlightVectorRaw, FlightVectorSchema } from "./api/data-definition"
import { is } from "superstruct"


export default function Hour(props: { config: Config, flightData: Observable<FlightVectorRaw[]> }) {
    const [data, setData] = useState(0)


    useEffect(() => {
        const sub = props.flightData.pipe(
            map(fs => fs.filter((f): f is FlightVector => {
                return is(f, FlightVectorSchema)
            })),
            mergeMap(fs => flightsPerHour(props.config, fs, xs => geoFilter(props.config, xs)))
        ).subscribe((no: Number) => setData(no))

        return () => sub.unsubscribe()
    }, [setData])

    return (
        <Card>
            <Card.Header>Amount of flights above the Netherlands</Card.Header>
            <Card.Body>
                {data}
            </Card.Body>
        </Card>
    )
}