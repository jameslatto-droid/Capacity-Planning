import * as React from 'react'
import { useEffect } from 'react'
import { App } from '../../../ported/app/App'
import appCss from '../../../ported/styles/app.css'

export interface IAppContext {
  siteUrl: string
  currentUserDisplayName: string
  currentUserEmail: string
  environment: 'sharepoint'
  dataMode: 'mock' | 'sharepoint'
}

export interface ICapacityPlannerAppProps {
  appContext: IAppContext
}

const STYLE_ID = 'capacity-planner-app-styles'

const CapacityPlannerApp: React.FC<ICapacityPlannerAppProps> = ({ appContext }) => {
  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement('style')
      styleEl.id = STYLE_ID
      styleEl.textContent = appCss
      document.head.appendChild(styleEl)
    }
    return () => {
      // Leave styles in place — removing them on unmount would break re-mounts
    }
  }, [])

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', height: '100%' }}>
      <App spfxContext={appContext} />
    </div>
  )
}

export default CapacityPlannerApp
