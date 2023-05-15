

export function dateFromTimeStamp(time_position: number) {
    return new Date(time_position * 1000)
}

export function currentHour() {
    return new Date().getHours()
}