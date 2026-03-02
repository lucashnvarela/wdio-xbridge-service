import type { Capabilities, Options, Services } from "@wdio/types"
import { XBridge } from "./xbridge.js"

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
    browser.X = XBridge
  }
}