'use client'

import { Card } from "react-bootstrap"
import { geoFilter, slidingWindows } from "./Batch"
import { Observable, map, mergeMap } from "rxjs"
import { useEffect, useState } from "react"
import { Config, intervalsInAnHour } from "./Config"
import { FlightVector, FlightVectorRaw, FlightVectorSchema } from "./api/data-definition"
import { is } from "superstruct"


export default function Hour(props: { config: Config, flightData: Observable<FlightVectorRaw[]> }) {
    const [data, setData] = useState(0)
    const bufferSize = intervalsInAnHour(props.config)

    useEffect(() => {
        console.log("executing Hour effect")
        const sub = props.flightData.pipe(
            map(fs => fs.filter((f): f is FlightVector => {
                return is(f, FlightVectorSchema)
            })),
            mergeMap(fs => geoFilter(props.config, fs)),
            map(xs => xs.length),
            slidingWindows(bufferSize),
            map(xs => {
                console.log(xs.toArray())
                return xs.reduce((a, b) => a + b, 0) / xs.size;
            })
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