import type { Capabilities, Options, Services } from "@wdio/types" with { "resolution-mode": "import" }
import { XBridge } from "./xbridge"

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