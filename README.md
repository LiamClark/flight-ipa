# Flight IPA #
Dear reviewer, welcome to my submission of the Flight API assignment. First of all I would like to explain that the project is called Flight IPA because the recruiter misnamed it this way and I thought that was hilarious. This readme mainly serves as a description of how the APP is structured, motivation for why I created it this way and some of my own idea for improvements and questions about more improvements.

## Background ##
Normally I would see my self much more as a back end developer than a front-end developer, when reading the requirements however and noticing there was no real need to persist any data. I thought a front-end framework made much more sense. I saw this as a great opportunity to learn `React`,`TypeScript`, `tailwindcss` and `Next.js`, since I'd never worked with either before.

The project was made in about a week and heavily relies on `RxJS` since FRP was mentioned as a requirement and I do have experience with Rx from other languages that became the first part for me to experience TypeScript while also being able to work on logic for the app.

## Overall structure ##
There is one big shared observable that polls the FlightApiEndPoint, this is owned by the root component of the app in `page.tsx`. The logic to process these event streams is located in `FlightObservables.ts`. The polling interval is core in the implementation of most features and can be configured in `Config.ts`. The polling interval is currently set up to avoid a timeout on the api even if the app is running all day, feel free to change the configuration to a smaller polling interval for testing purposes.
The main stream is passed down to child components which process the data and subscribe in a `useEffect` hook.

All the components have all their state live inside the `Observable` monad and the `scan` operator, essentially forming a poor man's `redux`. I would be especially interested in any suggestions on how to better integrate the `Observables` into `react` / `redux` .

I decided to use `Immutable` js to perform these stateful operations on immutable and persistent data structures.

Finally I felt the need for strong types around the network and wanted to avoid any as much as possible. I chose to create some "schemas" using `superstruct` the definitions for the types all live in `app/api/data-definitions.ts`. Superstruct provided great validation and type narrowing tools for this project.

I will now go over all the implemented features:

### Flights per hour above the Netherlands ###
The feature to give the rate of flights above the Netherlands starts with the need to do reverse-geo-location from the longitude and latitude data of the flight. There were packages available to do this, one of the simpler ones was: `country-locator`. I wrote some exploratory tests for this to see if it works with Jest. Shipping the entire library to the client was a no-go however, it would ship a few mb of json to the client for the country data.

Therefore there is one `next.js` endpoint in `app/api/route.ts`, the import of the library however would silently crash and remove the route. This is due to the library loading their own file incorrectly (somehow?). The work around for this was to reverse engineer the minimal part of the library I needed and inject my own geoJson file.
There are two takeaways here:

1. This is the reason for the odd code in `geo-location.ts`
2. How could I get to the error of the file loading?

Finally I interpreted the requirement as taking a sliding window of all the polling intervals that fit in an hour, then average the amount of flights above the Netherlands to display the final number.

### Top countries of Origin ###
For the top countries of Origin the biggest gotcha is to not count flights from the previous polling interval again. Therefore besides state for how common a country of origin is. There is also state tracking for which callsigns have been counted already, to deduplicate the flights.


### Flight diffs ###
A small bonus feature I wanted to implement was the signaling of which flights are new and which flights have completed since the last polling interval. Currently the app displays the amount of new and completed flights.

### Flights per layer + warnings ###
The final feature is to show flights per altitude layer the data aggregation for this follows a very similar pattern as the previous features. The flights are grouped by their altitude into a `Immutable.js` map. Then linear interpolation happens with the current flights vertical rate and when if we expect it will pass into a new layer.

The hard part of the implementation here is the enormous amount of flights that need to be displayed. The api easily returns 10.000 flights for each call. React starts struggling to render at that amount.

The first decision is to create a `Accordion` for each layer to minimize the amount of data on the screen.

Therefore I used `react-window` to do `windowing` or `virtualisation` of the grid to display all the flights. Here is the biggest flaw in the app, the dimensions off these grids are hardcoded, since they are required as values in js props.
They library did offer an `AutoSizer` in `react-virtualized-auto-sizer`, however replicating their example caused my grid to not be rendered inside it's `Accordion`.

Therefore the big question is: How do react developers do `virtualisation` or `windowing` in a way that the size information can still be controlled with `tailwind`?

Apart from the hardcoded size, it did fix the performance problems. The amount of warnings for the entire layer is displayed on the accordion, finally the flights with warnings are shown at the start of the grid.

## Conclusion ##
I hope this sufficiently motivates my design choices for this project. My own big questions were:
1. How to find errors relating to the module loading
2. How to do windowing with dimensions controlled by `tailwind`
3. How to integrate `Rx` in a better fashion with `React`

I would also like to mention a small note about testing in this project, setting up `Jest` was one of the first things I did. However I did not find the time to also learn the testing tools for `Rx`, `Next.js` apis and `React`.

A small afterthought: what is the preferred way of importing files from my own project: './Module' or '@app/module'

The biggest thing I also missed out on in `Next.js` is the hydration aspect. Nearly all the components run completely on the client: How could hydration be integrated into this project? 

Thank you for reading and I hope you enjoy reviewing the project.