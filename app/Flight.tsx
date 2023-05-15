'use client'

import { useState, useEffect } from 'react';

const testing = true

function loadData() {
    const url = testing ? "http://localhost:3000/flight.json" : "https://opensky-network.org/api/states/all"
    return fetch(url)
        .then(r => r.json())
}

export default function Flight() {
    const [data, setData] = useState(null);

    useEffect(() => {
        loadData()
            .then(j => {
                console.log(j)
                return setData(j)
            })
    }, [data, setData])

    return (<h1>{data ? data.time : "null"}</h1>)
}