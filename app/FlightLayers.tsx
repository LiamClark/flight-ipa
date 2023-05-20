'use client'

import { Card } from "react-bootstrap"
import { Observable } from "rxjs"
import { FlightVectorRaw } from "./api/data-definition"

export default function FlightLayers(props: {flightData: Observable<FlightVectorRaw[]>}) {
    return (
        <Card>
            <Card.Header>Flight Layers</Card.Header>
            <Card.Body>
                <p>layers and ogres</p>
            </Card.Body>
        </Card>
    )
}