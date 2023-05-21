import { Card, CardBody, Typography } from "@material-tailwind/react";
import { Observable, map } from "rxjs";
import { Set } from "immutable"
import { FlightVector, FlightVectorRaw, FlightVectorSchema } from "./api/data-definition";
import { useEffect, useState } from "react";
import { DiffState, newOld } from "./Batch";
import { is } from "superstruct"


export default function FlightDiff(props: { flightData: Observable<FlightVectorRaw[]> }) {
    const seed: DiffState = {
        all: Set(),
        newItems: Set(),
        removed: Set()
    }
    const [data, setData] = useState(seed)

    useEffect(() => {
        const sub = props.flightData.pipe(
            map(fs => fs.filter((f): f is FlightVector => {
                return is(f, FlightVectorSchema)
            })),
            newOld,
        ).subscribe(st => setData(st))
        return () => sub.unsubscribe()
    }, [setData]
    )

    return (
        <Card className="mt-6 w-96 border-solid border-2">
            <CardBody>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    New & finished flights
                </Typography>
                <Typography>
                    {data.newItems.size} {data.removed.size}
                </Typography>
            </CardBody>
        </Card>
    );
}