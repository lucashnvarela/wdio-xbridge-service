import XBridgeService from "./service";
import { Locator, type Selector } from "./xbridge";

export default XBridgeService;
export { Locator };

declare global {
	namespace WebdriverIO {
		interface Browser {
			X: (selector: Selector) => Locator;
		}
	}
}
