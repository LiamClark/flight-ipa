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
import { FixedSizeGrid } from 'react-window'
import { CSSProperties } from "react";


function FlightLayerItem(props: {
    no: number,
    open: number,
    planes: FlightVector[],
    handleClick: (n: number) => void
}) {

    const colCount = 100
    const rowCount = 5

    function index(row: number, col: number) {
        return row * colCount + col
    }

    const Cell = (cellProps: {
        columnIndex: number,
        rowIndex: number,
        style: CSSProperties,
    }) => {
        const plane = props.planes[index(cellProps.rowIndex, cellProps.columnIndex)]

        if (plane) {
            return (<div style={cellProps.style}>
                Item {plane.callsign}
            </div>)
        }
    }


    return (<Accordion open={props.open === props.no}>
        <AccordionHeader className="text-sm py-2" onClick={() => props.handleClick(props.no)}>
            {layerString(props.no)}
        </AccordionHeader>
        <AccordionBody className="py-2">
            <FixedSizeGrid columnCount={colCount} columnWidth={150} rowCount={rowCount} rowHeight={15}
                width={300} height={500}
            >
                {Cell}
            </FixedSizeGrid>
        </AccordionBody>
    </Accordion>)
}

function layerString(no: number): string {
    return `layer ${no * 1000} - ${(no + 1) * 1000}`
}

export default function FlightLayers(props: { flightData: Observable<FlightVectorRaw[]> }) {
    const [open, setOpen] = useState(1);
    const items :[number, FlightVector[]][] = [
        [1, [] as FlightVector[]],
        [2, [] as FlightVector[]],
        [3, [] as FlightVector[]],
        [4, [] as FlightVector[]],
        [5, [] as FlightVector[]],
        [6, [] as FlightVector[]],
    ]
    const initialState: Map<number, FlightVector[]> = Map(items) 
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