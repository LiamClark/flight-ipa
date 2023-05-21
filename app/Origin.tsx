'use client'

import { useState, useEffect } from 'react';
import { scanOccurenceMap } from './Batch'
import { Observable, map, tap } from 'rxjs';
import { Map } from 'immutable'
import { FlightVectorRaw } from './api/data-definition';
import { Card, CardBody, List, ListItem, Typography } from '@material-tailwind/react';

function topThree(m: Map<string, number>): [string, number][] {
    const seq = m.toKeyedSeq()
    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
}

export default function Origin(props: { flightData: Observable<FlightVectorRaw[]> }) {
    const [data, setData] = useState([] as [string, number][]);

    useEffect(() => {
        const sub = props.flightData
            .pipe(
                scanOccurenceMap(),
                map(([m, _]) => m),
                map(topThree)
            )
            .subscribe(countries => {
                setData(countries)
            })

        //cleanup
        return () => { sub.unsubscribe() }

    }, [setData])

    const countryItems = data.map(([country, count], i) =>
        <li key={i.toString()}>
            <p className='text-lg inline'>{i.toString()}. </p> {country + " with: #" + count + " flights"}
        </li>
    )

    return (<Card className="mt-6 w-96 border-solid border-2 ">
        <CardBody>
            <Typography variant="h5" color="blue-gray" className="mb-2">
                Top three countries of origin 
            </Typography>
            <ol className='divide-y divide-slate-400'>
                {countryItems}
            </ol>
        </CardBody>
    </Card>
    )
}