import XBridgeService from "./service.js"
import { XBridge } from "./xbridge.js"

export default XBridgeService
export { XBridge }

declare global {
  namespace WebdriverIO {
    interface Browser {
      X: typeof XBridge
    }
  }
}