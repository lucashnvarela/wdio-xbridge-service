import type { Capabilities, Options, Services } from "@wdio/types" with { "resolution-mode": "import" }
import logger from "@wdio/logger"
import { XBridge, verifySuportedPlatform } from "./xbridge"

const log = logger("wdio-xbridge-service")

export default class XBridgeService implements Services.ServiceInstance {
  constructor(
    public options?: Services.ServiceOption,
    public capabilities?: Capabilities.ResolvedTestrunnerCapabilities,
    public config?: Options.WebdriverIO,
  ) {}

  async before(
    capabilities: Capabilities.RequestedStandaloneCapabilities,
    specs: string[],
    browser: WebdriverIO.Browser,
  ) {
    const platformName = capabilities
    verifySuportedPlatform(platformName)

    browser.X = XBridge
    log.info(`Service registered for ${platformName} session`)
  }
}