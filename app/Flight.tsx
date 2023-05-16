'use client'

import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Config } from './Config';

import { loadData as bload, topCountries } from './Batch'


const config: Config = {
    testing: true,
    pollingInterval: 5000
}

function loadData() {
    return topCountries(bload(config))

}

export default function Flight() {
    const empty: string[] = []
    const [data, setData] = useState(empty);

    useEffect(() => {
        const sub = loadData()
            .subscribe(countries => { 
                    setData(countries)
                    console.log(countries)
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