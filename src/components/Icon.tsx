import { library, type IconName } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowDown,
  faArrowRightArrowLeft,
  faArrowTrendUp,
  faArrowUp,
  faBagShopping,
  faBars,
  faBuildingColumns,
  faCalendar,
  faCalendarDays,
  faCar,
  faChartLine,
  faChartPie,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCirclePlus,
  faCoins,
  faCreditCard,
  faDeleteLeft,
  faDivide,
  faEarthAsia,
  faEllipsis,
  faEquals,
  faFileInvoiceDollar,
  faFilm,
  faGasPump,
  faGear,
  faGift,
  faGraduationCap,
  faHeartPulse,
  faHome,
  faLaptopCode,
  faMagnifyingGlass,
  faMinus,
  faMoneyBillWave,
  faPalette,
  faPencil,
  faPenToSquare,
  faPlane,
  faPlus,
  faPlusMinus,
  faRotate,
  faRotateLeft,
  faSpa,
  faTag,
  faUtensils,
  faWallet,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type React from 'react'

library.add(
  faArrowDown,
  faArrowRightArrowLeft,
  faBars,
  faDeleteLeft,
  faDivide,
  faEquals,
  faMinus,
  faPlusMinus,
  faArrowTrendUp,
  faArrowUp,
  faBagShopping,
  faBuildingColumns,
  faCalendar,
  faCalendarDays,
  faCar,
  faChartLine,
  faChartPie,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCirclePlus,
  faCoins,
  faCreditCard,
  faEarthAsia,
  faEllipsis,
  faFileInvoiceDollar,
  faFilm,
  faGasPump,
  faGear,
  faGift,
  faGraduationCap,
  faHeartPulse,
  faHome,
  faLaptopCode,
  faMagnifyingGlass,
  faMoneyBillWave,
  faPalette,
  faPencil,
  faPenToSquare,
  faPlane,
  faPlus,
  faRotate,
  faRotateLeft,
  faSpa,
  faTag,
  faUtensils,
  faWallet,
  faXmark,
)

interface IconProps {
  name: string
  className?: string
  style?: React.CSSProperties
}

export function Icon({
  name,
  className,
  style,
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={['fas', name.replace('fa-', '') as IconName]}
      className={className}
      style={style as never}
    />
  )
}
