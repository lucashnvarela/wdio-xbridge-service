import XBridgeService from "./service"
import { XBridge, IOSNodeType, AndroidNodeType } from "./xbridge"

export default XBridgeService
export { XBridge, IOSNodeType, AndroidNodeType }

declare global {
  namespace WebdriverIO {
    interface Browser {
      X: typeof XBridge
    }
  }
}