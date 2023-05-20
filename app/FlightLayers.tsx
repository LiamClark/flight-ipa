'use client'

import { Card } from "react-bootstrap"
import { Observable } from "rxjs"
import { FlightVector } from "./Batch"

export default function FlightLayers(props: {flightData: Observable<FlightVector[]>}) {
    return (
        <Card>
            <Card.Header>Flight Layers</Card.Header>
            <Card.Body>
                <p>layers and ogres</p>
            </Card.Body>
        </Card>
    )
}