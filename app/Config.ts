
export class Config {
    readonly testing: boolean
    //polling interval in ms
    readonly testPollingInterval: number = 5000
    productionPollingInterval: number = 56250
    geoFilterUrl: string


    //400 tokens per day, 4 tokens per request means 100 requests per day
    //4.16 requests per hour and that is 56250 in miliseconds
    constructor(testing: boolean, geoFilterUrl: string, testPollingInterval: number = 5000) {
        this.testPollingInterval = testPollingInterval 
        //400 tokens per day, 4 tokens per request means 100 requests per day
        //4.16 requests per hour and that is 56250 in miliseconds
        this.productionPollingInterval = 56250
        this.testing = testing
        this.geoFilterUrl = geoFilterUrl
     }

     pollingInterval() {
        if (this.testing) {
            return this.testPollingInterval
        } else {
            return this.productionPollingInterval
        }
     }

}

export function intervalsInAnHour(config: Config) {
    const factorToHour = 3_600_000 / config.pollingInterval()
    return Math.floor(factorToHour)
}

export function convertToHourlyRate(config: Config, n: number) {
    const factorToHour = 3_600_000 / config.pollingInterval()
    return n * factorToHour 
}