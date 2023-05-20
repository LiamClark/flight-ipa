'use client'

import { Card } from "react-bootstrap"
import { FlightVector, flightsPerHour } from "./Batch"
import { Observable, map, mergeMap } from "rxjs"
import { useEffect, useState } from "react"
import { Config } from "./Config"


export default function Hour(props: { config: Config, flightData: Observable<FlightVector[]>}) {
    const [data, setData] = useState(0)

    useEffect(() => {
        const sub = props.flightData.pipe(
            mergeMap(fs => flightsPerHour(props.config, fs))
        ).subscribe((no: Number) => {
            setData(no)
        })

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