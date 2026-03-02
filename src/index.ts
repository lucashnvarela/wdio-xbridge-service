import XBridgeService from "./service"
import { XBridge } from "./xbridge"

export default XBridgeService
export { XBridge }

declare global {
  namespace WebdriverIO {
    interface Browser {
      X: typeof XBridge
    }
  }
}