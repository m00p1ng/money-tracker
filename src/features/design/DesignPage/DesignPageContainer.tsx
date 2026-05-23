import { useDesignPage } from './useDesignPage'
import { DesignPage } from './DesignPage'

export function DesignPageContainer() {
  const props = useDesignPage()
  return <DesignPage {...props} />
}
