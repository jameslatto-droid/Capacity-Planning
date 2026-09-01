import * as React from 'react'
import * as ReactDom from 'react-dom'
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base'
import StackTestApp from './components/StackTestApp'

export default class StackTestWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const LOG = (msg: string, ...args: any[]) =>
      console.log(`[CapacityPlannerStackTest] ${msg}`, ...args)
    try {
      LOG('WebPart.render() called — SPFx 1.20.0')
      const element = React.createElement(StackTestApp, { spfxVersion: '1.20.0' })
      ReactDom.render(element, this.domElement)
      LOG('ReactDom.render() succeeded')
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      const stack = e instanceof Error ? e.stack : String(e)
      console.error('[CapacityPlannerStackTest] FATAL render() error:', e)
      this.domElement.innerHTML = `
        <div style="padding:20px;background:#1a0000;color:#ff9999;font-family:monospace;border-radius:8px">
          <h3 style="color:#ff6b6b;margin:0 0 12px">[CapacityPlannerStackTest] FATAL: WebPart Render Error</h3>
          <p><b>SPFx version:</b> 1.20.0</p>
          <p><b>Type:</b> ${typeof e}</p>
          <p><b>Constructor:</b> ${e?.constructor?.name ?? 'unknown'}</p>
          <p><b>Message:</b> ${msg}</p>
          <pre style="overflow:auto;max-height:300px;background:#0f0000;padding:12px;border-radius:4px">${stack}</pre>
        </div>
      `
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement)
  }
}
