import { DesignPage } from './DesignPage'
import { useDesignPage } from './useDesignPage'

export function DesignPageContainer() {
  const props = useDesignPage()

  return <DesignPage {...props} />
}
