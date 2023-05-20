'use client'

import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Config } from './Config';

import { FlightVector, loadData as bload, scanOccurenceMap } from './Batch'
import { Observable, map } from 'rxjs';
import { Map } from 'immutable'

function topThree(m: Map<string, number>): string[] {
    const seq = m.toKeyedSeq()

    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
        .map(([s, _]) => s)
}

export default function Flight(props: {flightData: Observable<FlightVector[]>}) {
    const [data, setData] = useState([] as string[]);

    useEffect(() => {
        const sub = props.flightData
            .pipe(
                scanOccurenceMap(),
                map(topThree)
            )
            .subscribe(countries => {
                setData(countries)
            })

        //cleanup
        return () => { sub.unsubscribe() }

    }, [setData])

    const countryItems = data.map((country, i) =>
        <li key={i.toString()}>
            {country}
        </li>
    )

    return (
        <Card>
            <Card.Header>Most popular origin countries</Card.Header>
            <Card.Body>
                <ol>
                    {countryItems}
                </ol>
                <Card.Text>



                </Card.Text>
            </Card.Body>
        </Card>
    )
}