'use client'

import Origin from './Origin'
import { Disclosure } from '@headlessui/react'
import { BellIcon } from '@heroicons/react/24/outline'
import Hour from './Hour'
import { BehaviorSubject, Observable, filter, share, tap } from 'rxjs'
import { loadData } from './FlightObservables'
import { Config } from './Config'
import FlightLayers from './FlightLayers'
import { FlightVectorRaw } from './api/data-definition'
import FlightDiff from './FlightDiff'

const config: Config = new Config(true, "http://localhost:3000/api")

// For today let's make a hot observable, pass it down as props.
// Then subscribe to it in a useEffect hook, since the observable
// depends on no reactive values no re-renders should occur
function multiCastedFlights(): Observable<FlightVectorRaw[]> {
  return loadData(config)
    .pipe(
      tap(m => console.log("fetching event")),
      share({ connector: () => new BehaviorSubject([] as FlightVectorRaw[]) }),
      filter(xs => xs.length != 0)
    )
}

export default function Example() {
  // Do I need to put multiCastedFlights in an useEffect hook, because it is hot?  
  const flightData = multiCastedFlights()

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-8 w-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <button
                        type="button"
                        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>

        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className='bg-white'>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className='flex flex-row flex-wrap space-x-4' style={{ justifyContent: 'space-around' }} >
              <Origin flightData={flightData} />
              <Hour config={config} flightData={flightData} />
              <FlightDiff flightData={flightData} />
            </div>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-400"></div>
              <span className="flex-shrink mx-4 text-gray-400">Flights per km</span>
              <div className="flex-grow border-t border-gray-400"></div>
            </div>
            <FlightLayers config={config} flightData={flightData} />
          </div>
        </main>
      </div>
    </>
  )
}