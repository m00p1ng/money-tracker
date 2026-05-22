import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library, type IconName } from '@fortawesome/fontawesome-svg-core'
import {
  faArrowDown,
  faArrowUp,
  faBagShopping,
  faCalendar,
  faCar,
  faCheck,
  faChevronLeft,
  faCirclePlus,
  faEllipsis,
  faFileInvoiceDollar,
  faFilm,
  faGift,
  faGraduationCap,
  faHeartPulse,
  faHome,
  faMoneyBillWave,
  faPencil,
  faPlane,
  faSpa,
  faUtensils,
  faWallet,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faArrowDown,
  faArrowUp,
  faBagShopping,
  faCalendar,
  faCar,
  faCheck,
  faChevronLeft,
  faCirclePlus,
  faEllipsis,
  faFileInvoiceDollar,
  faFilm,
  faGift,
  faGraduationCap,
  faHeartPulse,
  faHome,
  faMoneyBillWave,
  faPencil,
  faPlane,
  faSpa,
  faUtensils,
  faWallet,
  faXmark,
)

export function Icon({ name, className }: { name: string; className?: string }) {
  return <FontAwesomeIcon icon={['fas', name.replace('fa-', '') as IconName]} className={className} />
}
