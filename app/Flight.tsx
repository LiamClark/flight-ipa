'use client'

import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Config } from './Config';

import { loadData as bload, scanOccurenceMap } from './Batch'
import { Observable, map } from 'rxjs';
import { Map } from 'immutable'

const config: Config = {
    testing: true,
    pollingInterval: 5000
}

function loadData(): Observable<string[]> {
    return bload(config)
        .pipe(
            scanOccurenceMap(),
            map(topThree)
        )
}

function topThree(m: Map<string, number>): string[] {
    const seq = m.toKeyedSeq()

    return seq.sortBy((v, k) => v)
        .reverse()
        .take(3)
        .toArray()
        .map(([s, _]) => s)
}

export default function Flight() {
    const empty: string[] = []
    const [data, setData] = useState(empty);

    useEffect(() => {
        const sub = loadData()
            .subscribe(countries => {
                setData(countries)
            })

        //cleanup
        return () => { sub.unsubscribe() }

    }, [data, setData])

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