import { Observable, filter, map, scan } from "rxjs";
import { FlightVector } from "./Batch";
import { Seq, Map} from "immutable";

export function topCountry(data: Observable<FlightVector>): Observable<string> {
    const seed: Map<string, number> = Map()
    return data.pipe(
        scan((acc, v) => {
            const entry = acc.get(v.origin_country);
            const newCount = entry ? entry + 1 : 1;

            return acc.set(v.origin_country, newCount);
        }, seed),
        map(m => Seq(m.entries()).maxBy(([, count]) => count)?.[0]),
        filter((s): s is string => !!s)
    );
}