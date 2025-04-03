declare module 'persian-date' {
  export default class PersianDate {
    add(key: string, input: number): PersianDate
    clone(): PersianDate
    constructor(input?: Date | number | number[] | PersianDate | string)
    date(): number
    date(input: number): PersianDate
    dates(): number
    dates(input: number): PersianDate
    day(): number
    days(): number
    daysInMonth(): number
    diff(input: PersianDate, val: string): number
    diff(input: PersianDate, val: string, asFloat: boolean): number
    endOf(key: string): PersianDate
    format(key: 'L' | 'LLL' | 'LLLL'): string
    format(inputString: string): string
    formatPersian: boolean
    gDate: Date
    year(): number
    hour(): number
    hour(input: number): PersianDate
    hours(): number
    hours(input: number): PersianDate
    isDST(): boolean
    isLeapYear(): boolean
    millisecond(): number
    millisecond(input: number): PersianDate
    milliseconds(): number
    milliseconds(input: number): PersianDate
    minute(): number
    minute(input: number): PersianDate
    minutes(): number
    minutes(input: number): PersianDate
    month(): number
    monthDayNumber(): number
    persianDate(): PersianDateDetails
    rangeName(): { months: string[]; weekdays: string[] }
    seconds(): number
    second(): number
    second(input: number): PersianDate
    seconds(input: number): PersianDate
    startOf(key: string): PersianDate
    static isPersianDate(obj: unknown): boolean
    static rangeName(): { months: string[] }
    subtract(key: string, input: number): PersianDate
    timeZoneOffset(): number
    toArray(): number[]
    toCalendar(key: 'persian' | 'gregorian'): PersianDate
    toDate(): Date
    toLocale(key: 'en' | 'fa'): PersianDate
    unix(): number
    valueOf(): number
    weekdays(): string[]
    weekDayNumber(): number
    year(input: number): PersianDate
    years(): number
    years(input: number): PersianDate
    zone(): number
  }

  export interface PersianDateDetails {
    date(): number
    date(value: number): void
    day(): number
    day(value: number): void
    hours(): number
    hours(value: number): void
    milliseconds(): number
    milliseconds(value: number): void
    minutes(): number
    minutes(value: number): void
    month(): number
    month(value: number): void
    monthDayNumber(): number
    monthDayNumber(value: number): void
    seconds(): number
    seconds(value: number): void
    timeZoneOffset(): number
    timeZoneOffset(value: number): void
    weekdays(): string[]
    weekdays(value: string[]): void
    weekDayNumber(): number
    weekDayNumber(value: number): void
    year(): number
    year(value: number): void
  }

  export function persianDate(): PersianDate
  export function persianDate(input: Date): PersianDate
  export function persianDate(input: number): PersianDate
  export function persianDate(input: number[]): PersianDate
  export function persianDate(input: PersianDate): PersianDate
  export function persianDate(input: string): PersianDate
}
