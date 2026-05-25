import { CalendarPage } from './CalendarPage'
import { useCalendarPage } from './useCalendarPage'

export function CalendarPageContainer() {
  const props = useCalendarPage()

  return <CalendarPage {...props} />
}
