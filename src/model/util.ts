import { Duration } from "luxon";

export function toTimeInputStirng(duration: Duration) {
    return duration.hours.toString().padStart(2, '0')
        + ':' +
        duration.minutes.toString().padStart(2, '0')
        + ':' +
        duration.seconds.toString().padStart(2, '0')
}

export function toDuration(time?: string) {
    if (!time) {
        return Duration.fromObject({ hour: 0, minute: 0, second: 0 });
    }
    const [hourStr, minuteStr, secondStr] = time.split(':');
    const hour = Number.isNaN(Number.parseInt(hourStr)) ? 0 : Number.parseInt(hourStr);
    const minute = Number.isNaN(Number.parseInt(minuteStr)) ? 0 : Number.parseInt(minuteStr);
    const second = Number.isNaN(Number.parseInt(secondStr)) ? 0 : Number.parseInt(secondStr);
    return Duration.fromObject({
        hour, minute, second
    });
}
