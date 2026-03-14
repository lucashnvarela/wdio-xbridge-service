import XBridgeService from "./service";
import { Locator, Selector } from "./xbridge";

export default XBridgeService;
export { Locator, Selector };

declare global {
	namespace WebdriverIO {
		interface Browser {
			$X(selector: Selector): Locator;
		}
	}
}
