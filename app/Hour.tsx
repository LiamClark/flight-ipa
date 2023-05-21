'use client'

import { geoFilter, slidingWindows } from "./Batch"
import { Observable, map, mergeMap } from "rxjs"
import { useEffect, useState } from "react"
import { Config, intervalsInAnHour } from "./Config"
import { FlightVector, FlightVectorRaw, FlightVectorSchema } from "./api/data-definition"
import { is } from "superstruct"
import { Card, CardBody, CardFooter, Typography } from "@material-tailwind/react"


export default function Hour(props: { config: Config, flightData: Observable<FlightVectorRaw[]> }) {
    const [data, setData] = useState(0)
    const bufferSize = intervalsInAnHour(props.config)

    useEffect(() => {
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

    return (<Card className="mt-6 w-96 border-solid border-2">
        <CardBody>
            <Typography variant="h5" color="blue-gray" className="mb-2">
                Amount of flights above the Netherlands average per hour
            </Typography>
            <Typography className="text-center text-xl font-medium">
                {data}
            </Typography>
        </CardBody>
    </Card>
    )
}