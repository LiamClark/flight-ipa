import { currentHour, dateFromTimeStamp } from "@/app/TimeWindows";
import { data } from "./test";
import { Config, convertToHourlyRate, intervalsInAnHour } from "@/app/Config"


describe('TimeWindows', () => {
    //Lovely timezone frustration
    //The js date is in UTC but getHours() moves to our timezone which on today is a +2 difference
    //Meaning this test will get flaky later on
    test('the flight stamp', () => {
        const timeStamp = data.at(0)!.time_position
        const date = dateFromTimeStamp(timeStamp)

        console.log(date)

        expect(date.getHours()).toBe(18);
    });

    test('current hour', () => {
        console.log(currentHour())
    })


    test('hourly rate config', () => {
        const fiveMinutes = 300000
        const config: Config = {
            testing: true,
            pollingInterval: fiveMinutes,
            geoFilterUrl: ""
        }
        const planesPerHour = convertToHourlyRate(config, 30)
        expect(planesPerHour).toBeCloseTo(30 * 12)
    })

    test('hourly rate config', () => {
        const fiveMinutes = 300000
        const config: Config = {
            testing: true,
            pollingInterval: fiveMinutes,
            geoFilterUrl: ""
        }
        const pollsPerHour = intervalsInAnHour(config)
        expect(pollsPerHour).toBe(12)
    })
});