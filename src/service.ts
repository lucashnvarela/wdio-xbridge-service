import type { Services } from "@wdio/types" with { "resolution-mode": "import" }
import logger from "@wdio/logger"
import { XBridge, verifySupportedPlatform } from "./xbridge"

const log = logger("wdio-xbridge-service")

export default class XBridgeService implements Services.ServiceInstance {
  private platformName: string

  constructor(
    _options: never,
    capabilities: WebdriverIO.Capabilities,
    _config: never,
  ) {
    this.platformName = capabilities.platformName || capabilities["appium:platformName"] || capabilities["bstack:options"]?.platformName || "*unknown*"
    verifySupportedPlatform(this.platformName)
  }

  async before(
    _capabilities: never,
    _specs: never,
    browser: WebdriverIO.Browser,
  ) {
    browser.X = XBridge
    log.info(`Service registered for ${this.platformName} session`)
  }
}