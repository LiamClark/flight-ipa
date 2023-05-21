"use client"

import { Fragment, useEffect, useState } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { FlightVector, FlightVectorRaw, FlightVectorSchema } from "./api/data-definition";
import { Observable, map, tap } from "rxjs";
import { is } from 'superstruct'
import { flightsInSlices } from "./Batch";
import { Map } from "immutable";


function FlightLayerItem(props: {
    no: number,
    open: number,
    planes: FlightVector[],
    handleClick: (n: number) => void
}) {
    return (<Accordion open={props.open === props.no}>
        <AccordionHeader className="text-sm py-2" onClick={() => props.handleClick(props.no)}>
            {layerString(props.no)}
        </AccordionHeader>
        <AccordionBody className="py-2">
            <ol>
                {props.planes.map(p => {
                    return <li key={p.callsign}><p>{p.callsign}</p></li>
                })}
            </ol>
        </AccordionBody>
    </Accordion>)
}

function layerString(no: number): string {
    return `layer ${no * 1000} - ${(no + 1) * 1000}`
}

export default function FlightLayers(props: { flightData: Observable<FlightVectorRaw[]> }) {
    const [open, setOpen] = useState(1);
    const initialState: Map<number, FlightVector[]> = Map({
        0: [] as FlightVector[],
        1: [] as FlightVector[],
        2: [] as FlightVector[],
        3: [] as FlightVector[],
        4: [] as FlightVector[],
        5: [] as FlightVector[],
    })
    const [flightLayers, setFlightLayers] = useState(initialState)
    const handleOpen = (value: number) => {
        setOpen(open === value ? 0 : value);
    };

    useEffect(() => {
        const sub = props.flightData.pipe(
            tap(fs => console.log(fs)),
            map(fs => fs.filter((f): f is FlightVector => {
                return is(f, FlightVectorSchema)
            })),
            tap(fs => console.log(fs)),
            map(flightsInSlices)
        ).subscribe(m => setFlightLayers(m))

        return () => sub.unsubscribe()
    }, [setFlightLayers])

    const sortedLayers = flightLayers.toSeq().sortBy((_, k) => k).toArray()
    const layers = sortedLayers
        .map(([layer, planes], i) => <FlightLayerItem key={layer} no={layer} planes={planes} open={open} handleClick={handleOpen} />)

    return (
        <div className="overflow-auto">
            {layers}
        </div>
    );
}

// export default function FlightLayers(props: { flightData: Observable<FlightVectorRaw[]> }) {
//     return (
//              )
// }