'use client'

import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { scanOccurenceMap } from './Batch'
import { Observable, map, tap } from 'rxjs';
import { Map } from 'immutable'
import { FlightVectorRaw } from './api/data-definition';

function topThree(m: Map<string, number>): [string, number][] {
    const seq = m.toKeyedSeq()
    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
    // .map(([s, k]) => s)
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
        <li className= 'list-group-item' key={i.toString()}>
            {country + " with: #" + count + " flights"}
        </li>
    )

    return (
        <Card>
            <Card.Header>Most popular origin countries</Card.Header>
            <Card.Body>
                <ol className='list-group list-group-numbered'>
                    {countryItems}
                </ol>
                <Card.Text>
                </Card.Text>
            </Card.Body>
        </Card>
    )
}