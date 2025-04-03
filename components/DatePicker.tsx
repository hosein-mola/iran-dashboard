'use client'
import { cn } from '@/lib/utils'
import { CalenderType } from '@/types/calender-type'
import { motion } from 'framer-motion'
import {
  ArrowRightCircleIcon,
  ArrowLeftCircleIcon,
  LucideRepeat1,
} from 'lucide-react'
import PersianDate from 'persian-date'
import { useEffect, useRef, useState } from 'react'

// Main DatePicker component
const DatePicker = ({
  date,
  setDate,
  calender,
  close,
}: {
  date: PersianDate
  setDate: React.Dispatch<React.SetStateAction<PersianDate>>
  calender: CalenderType
  close: (date: PersianDate) => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const _calender =
    calender == CalenderType.FA ? CalenderType.FA : CalenderType.EN

  const [calanderState, setCalanderState] = useState(
    new PersianDate(date).toCalendar(_calender)
  )

  const daysInMonth = calanderState.daysInMonth()
  const selectedYear = calanderState.toArray()[0]
  const selectedMonth = calanderState.toArray()[1]
  const selectedDay = calanderState.toArray()[2]

  const find = new PersianDate([
    calanderState.year(),
    calanderState.month(),
    1,
  ]).toLocale('en')

  const offset = Number(find.format('d')) - 1

  const [view, setView] = useState<'month' | 'year' | 'day'>('day')

  useEffect(() => {
    const clone = new PersianDate(calanderState)
    setDate(clone)
  }, [setDate, calanderState])

  const renderViewSelector = () => {
    const viewComponents = {
      month: (
        <MonthView
          calanderState={calanderState}
          setCalanderState={setCalanderState}
          setView={setView}
        />
      ),
      year: (
        <YearView
          calanderState={calanderState}
          setCalanderState={setCalanderState}
          setView={setView}
        />
      ),
      day: (
        <DayView
          calanderState={calanderState}
          setCalanderState={setCalanderState}
          daysInMonth={daysInMonth}
          offset={offset}
          close={close}
        />
      ),
    }

    return viewComponents[view] || viewComponents.day
  }

  return (
    <div
      ref={ref}
      dir="rtl"
      className={cn(
        'bg-background shadow-primary relative h-full w-full overflow-y-auto'
      )}
    >
      <DatePickerPanel
        calanderState={calanderState}
        setCalanderState={setCalanderState}
        setView={setView}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
      <DaysOfWeek calanderState={calanderState} />
      <div className="h-[18rem] max-h-[18rem] w-full p-2">
        {renderViewSelector()}
      </div>
    </div>
  )
}

export default DatePicker

// Panel component for navigating between months and resetting the date
const DatePickerPanel = ({
  calanderState,
  setCalanderState,
  setView,
  selectedDay,
  selectedMonth,
  selectedYear,
}: {
  calanderState: PersianDate
  setCalanderState: React.Dispatch<React.SetStateAction<PersianDate>>
  setView: React.Dispatch<React.SetStateAction<'month' | 'year' | 'day'>>
  selectedDay: number
  selectedMonth: number
  selectedYear: number
}) => {
  const next = () => {
    const update = calanderState.add('M', 1)
    setCalanderState(update)
  }

  const prev = () => {
    const update = calanderState.subtract('M', 1)
    setCalanderState(update)
  }

  const resetDate = () => {
    setCalanderState(new PersianDate())
  }

  return (
    <div
      className={cn(
        'bg-background border-border sticky top-0 mb-2 flex h-12 w-full items-center justify-between'
      )}
    >
      <button
        type={'button'}
        className={'flex w-auto items-center justify-center'}
        onClick={prev}
      >
        <ArrowRightCircleIcon
          className={'hover:text-primary mr-4 size-6 cursor-pointer'}
        />
      </button>

      <div
        className={cn(
          'rounded-b-0 bg-background text-foreground b flex h-10 items-center justify-center px-9 text-center text-xs leading-tight font-bold'
        )}
      >
        <LucideRepeat1
          onClick={() => resetDate()}
          className={'hover:text-primary h-4 w-4 cursor-pointer'}
        />
        <p className={'flex flex-row items-center'}>
          <span
            className={cn(
              'fa-num mt-1 flex flex-row-reverse items-center justify-center text-lg'
            )}
          >
            <span
              className={'hover:text-primary cursor-pointer px-2'}
              onClick={() => setView('year')}
            >
              {selectedYear ?? ''}
            </span>
            <span>/</span>{' '}
            <span
              className={'hover:text-primary cursor-pointer px-2'}
              onClick={() => setView('month')}
            >
              {selectedMonth ?? ''}
            </span>
            <span>/</span>
            <span
              className={'hover:text-primary cursor-pointer px-2'}
              onClick={() => setView('day')}
            >
              {selectedDay ?? ''}
            </span>
          </span>
        </p>
      </div>
      <button
        type={'button'}
        className={'flex w-auto items-center justify-center'}
        onClick={next}
      >
        <ArrowLeftCircleIcon
          className={'hover:text-primary ml-4 size-6 cursor-pointer'}
        />
      </button>
    </div>
  )
}

// Component to render days of the week
const DaysOfWeek = ({ calanderState }: { calanderState: PersianDate }) => {
  const renderWeekDays = () => {
    return calanderState.rangeName().weekdays.map((dayName: string) => {
      return (
        <h1
          key={'dweek' + dayName}
          className={cn(
            'text-accent-foreground flex h-8 items-center justify-center gap-3 text-xs'
          )}
        >
          {' '}
          {dayName}
        </h1>
      )
    })
  }
  return (
    <div
      className={cn(
        'bg-accent text-accent-foreground grid w-full cursor-pointer grid-cols-7 justify-items-center gap-2 rounded-xl text-center font-bold'
      )}
    >
      {renderWeekDays()}
    </div>
  )
}

// Component to render the day view
const DayView = ({
  calanderState,
  setCalanderState,
  daysInMonth,
  offset,
  close,
}: {
  calanderState: PersianDate
  setCalanderState: React.Dispatch<React.SetStateAction<PersianDate>>
  daysInMonth: number
  offset: number
  close: (date: PersianDate) => void
}) => {
  const renderOffsetStart = () => {
    return [...Array(offset).keys()].map((step) => {
      const day = daysInMonth - offset + step + 1
      return (
        <div key={day} className="">
          <h1
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-2xl p-4 text-sm font-extralight select-none'
            )}
            key={'day' + day}
          >
            {day}
          </h1>
        </div>
      )
    })
  }
  const selectDate = (day: number) => {
    const newDate = new PersianDate([
      calanderState.year(),
      calanderState.month(),
      day + 1,
    ])
    setCalanderState(newDate)
    close(newDate)
  }
  const renderDays = () => {
    return [...Array(daysInMonth).keys()].map((day) => {
      return (
        <div key={day} className="">
          <h1
            onClick={() => selectDate(day)}
            className={cn(
              'hover:bg-accent hover:text-accent-foreground text-md flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl font-bold select-none',
              Number(calanderState.date()) == Number(day + 1) &&
                'bg-accent text-accent-foreground'
            )}
            key={'day' + day}
          >
            {day + 1}
          </h1>
        </div>
      )
    })
  }
  const renderOffsetEnd = () => {
    const endOffset = 42 - (daysInMonth + offset)
    return [...Array(endOffset).keys()].map((day) => {
      return (
        <div key={day} className="">
          <h1
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-2xl p-4 text-sm font-extralight select-none'
            )}
            key={'day' + day}
          >
            {day + 1}
          </h1>
        </div>
      )
    })
  }

  return (
    <div
      className={cn(
        'grid grid-cols-7 place-content-center justify-items-center gap-4 text-center'
      )}
    >
      {renderOffsetStart()}
      {renderDays()}
      {renderOffsetEnd()}
    </div>
  )
}

// Component to render the month view
const MonthView = ({
  calanderState,
  setCalanderState,
  setView,
}: {
  calanderState: PersianDate
  setCalanderState: React.Dispatch<React.SetStateAction<PersianDate>>
  setView: React.Dispatch<React.SetStateAction<'month' | 'year' | 'day'>>
}) => {
  const selectMonth = (month: number) => {
    const newDate = new PersianDate([
      calanderState.toArray()[0],
      month,
      calanderState.toArray()[2],
    ])
    setCalanderState(newDate)
    setView('day')
  }

  const renderMonthName = () => {
    return PersianDate.rangeName().months.map(
      (monthName: string, index: number) => {
        return (
          <motion.h1
            key={monthName}
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => selectMonth(index + 1)}
            className={cn(
              'hover:text-accent-foreground hover:bg-accent text-foreground border-border flex h-full flex-1 flex-grow cursor-pointer items-center justify-center rounded-2xl border'
            )}
          >
            {monthName}
          </motion.h1>
        )
      }
    )
  }
  return (
    <div
      className={cn(
        'grid h-full w-full grid-cols-3 items-stretch justify-between gap-1 text-center'
      )}
    >
      {renderMonthName()}
    </div>
  )
}

// Component to render the year view
const YearView = ({
  calanderState,
  setCalanderState,
  setView,
}: {
  calanderState: PersianDate
  setCalanderState: React.Dispatch<React.SetStateAction<PersianDate>>
  setView: React.Dispatch<React.SetStateAction<'month' | 'year' | 'day'>>
}) => {
  const selectYear = (year: number) => {
    const newDate = new PersianDate([
      year,
      calanderState.toArray()[1],
      calanderState.toArray()[2],
    ])
    setCalanderState(newDate)
    setView('day')
  }

  const renderYearName = () => {
    return Array.from(
      { length: 70 },
      (x, i) => new PersianDate().toArray()[0] - i
    ).map((year) => {
      return (
        <motion.div
          key={year}
          className=""
          initial={{ opacity: 0, x: 200 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 200 }}
          transition={{ duration: 0.3 }}
          onClick={() => selectYear(year)}
        >
          <div
            className={cn(
              'hover:bg-accent border-border hover:text-background text-md flex h-16 w-full cursor-pointer items-center justify-center rounded-2xl border font-bold select-none'
            )}
            key={'year' + year}
          >
            {year + 1}
          </div>
        </motion.div>
      )
    })
  }

  return (
    <div
      className={cn(
        'grid w-full grid-cols-3 place-content-center gap-1 text-center'
      )}
    >
      {renderYearName()}
    </div>
  )
}
