
export interface Config {
    testing: boolean
    //polling interval in ms
    pollingInterval: number
    geoFilterUrl: string

}


export function convertToHourlyRate(config: Config, n: number) {
    const factorToHour = 3_600_000 / config.pollingInterval
    return n * factorToHour 
}