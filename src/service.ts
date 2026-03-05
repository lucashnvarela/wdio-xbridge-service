import type { Services } from "@wdio/types";
import { verifySupportedPlatform, XBridge } from "./xbridge";

export default class XBridgeService implements Services.ServiceInstance {
	private platformName: string;

	constructor(_options: never, capabilities: WebdriverIO.Capabilities, _config: never) {
		this.platformName =
			capabilities.platformName ??
			capabilities["appium:platformName"] ??
			capabilities["bstack:options"]?.platformName ??
			"*unknown*";
		verifySupportedPlatform(this.platformName);
	}

	async before(_capabilities: never, _specs: never, browser: WebdriverIO.Browser) {
		browser.X = XBridge;
	}
}
