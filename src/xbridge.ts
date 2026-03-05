import logger from "@wdio/logger";

enum PlatformName {
	iOS = "iOS",
	Android = "Android",
}

enum IOSNode {
	text = "StaticText",
	button = "Button",
	switch = "Switch",
	link = "Link",
	input = "TextField",
	textarea = "TextView",
	secureinput = "SecureTextField",
	image = "Image",
	window = "Window",
	cell = "Cell",
	webview = "WebView",
	collectionview = "CollectionView",
	scrollview = "ScrollView",
	other = "Other",
}

enum AndroidNode {
	text = "widget.TextView",
	button = "widget.Button",
	input = "widget.EditText",
	image = "widget.Image",
	imagebutton = "widget.ImageButton",
	imageview = "widget.ImageView",
	frame = "widget.FrameLayout",
	linear = "widget.LinearLayout",
	webview = "widget.WebView",
	scrollview = "widget.ScrollView",
	view = "view.View",
}

export enum NavigationAxis {
	Ancestor = "/ancestor::",
	Descendant = "/descendant::",
	Parent = "/parent::",
	Child = "/child::",
	Preceding = "/preceding-sibling::",
	Following = "/following-sibling::",
}

type XCUIElementType = `XCUIElementType${IOSNode}`;

type AndroidElementClass = `android.${AndroidNode}`;

enum IOSPredicates {
	label = '[@label="*value*"]',
	labelContains = '[contains(@label, "*value*")]',
	value = '[@value="*value*"]',
	name = '[@name="*value*"]',
}

enum AndroidPredicates {
	resourceId = '[@resource-id="*value*"]',
	text = '[@text="*value*"]',
	textContains = '[contains(@text, "*value*")]',
	description = '[@content-desc="*value*"]',
}

type IOSSelector =
	| `${keyof typeof IOSNode}[${keyof typeof IOSPredicates}="${string}"]`
	| `${keyof typeof IOSNode}[${keyof typeof IOSPredicates}='${string}']`
	| `${keyof typeof IOSPredicates}="${string}"`
	| `${keyof typeof IOSPredicates}='${string}'`;

type AndroidSelector =
	| `${keyof typeof AndroidNode}[${keyof typeof AndroidPredicates}="${string}"]`
	| `${keyof typeof AndroidNode}[${keyof typeof AndroidPredicates}='${string}']`
	| `${keyof typeof AndroidPredicates}="${string}"`
	| `${keyof typeof AndroidPredicates}='${string}'`;

export type Selector = IOSSelector | AndroidSelector | [IOSSelector, AndroidSelector] | [AndroidSelector, IOSSelector];

interface XPathParams {
	context?: string;
	axis?: NavigationAxis;
	selector: Selector;
}

export enum Exception {
	UnknownPlatform = "UnknownPlatformError",
	SelectorRequired = "SelectorRequiredError",
	InvalidSelector = "InvalidSelectorError",
	InvalidAttribute = "InvalidAttributeError",
	NotDisplayedAfterSwipe = "NotDisplayedAfterSwipeError",
}

const log = logger("wdio-xbridge-service");

class XBridgeServiceError extends Error {
	constructor(err: { name: Exception; message: string }) {
		log.error(err.message);
		super(err.message);
		this.name = err.name;
	}
}

export function verifySupportedPlatform(platformName: string) {
	if (!Object.values<string>(PlatformName).includes(platformName)) {
		throw new XBridgeServiceError({
			name: Exception.UnknownPlatform,
			message: `Unsupported platform: "${platformName}". Expected one of [${Object.keys(PlatformName).join(", ")}].`,
		});
	}
}

export class XPathConstructor {
	private readonly INDEX_PATTERN = /^\((?<selector>.+)\)\[\d+\]$/;
	private readonly SELECTOR_PATTERN = /^(?<attr>\w+)=['"](?<value>[\w\s]+)['"]$/;
	private readonly NODE_SELECTOR_PATTERN = /^(?<node>\w+)?\[(?<attr>\w+)=['"](?<value>[\w\s]+)['"]\]$/;
	private readonly BOTH_SELECTOR_PATTERN = new RegExp(
		`^${this.SELECTOR_PATTERN.source}|${this.NODE_SELECTOR_PATTERN.source}$`,
	);

	private _context?: string;
	private axis?: NavigationAxis;
	private node?: XCUIElementType | AndroidElementClass;

	private predicates: string[] = [];

	constructor({ context, axis, selector }: XPathParams) {
		this.context = context;
		this.axis = axis;
		this.selector = selector;

		if (this.isRoot && !this.predicates.length && this.isAnyNodeType) {
			throw new XBridgeServiceError({
				name: Exception.SelectorRequired,
				message: "A selector must be specified for the current platform.",
			});
		}
	}

	private get isRoot(): boolean {
		return this.context === undefined;
	}

	private get hasNavigation(): boolean {
		return this.axis !== undefined;
	}

	private get hasNode(): boolean {
		return this.node !== undefined;
	}

	private get isAnyNodeType(): boolean {
		return !this.hasNode && (this.isRoot || this.hasNavigation);
	}

	get selector(): string {
		let selector = "";

		selector += this.isRoot ? "//" : this.hasNavigation ? `${this.context}${this.axis}` : this.context;

		selector += this.hasNode ? this.node : this.isAnyNodeType ? "*" : "";

		selector += this.predicates.join("");

		return selector;
	}

	private set selector(selector: Selector) {
		switch (typeof selector) {
			case "string": {
				const match = selector.match(this.BOTH_SELECTOR_PATTERN);
				if (!match?.groups) {
					throw new XBridgeServiceError({
						name: Exception.InvalidSelector,
						message: `Invalid selector: "${selector}". Expected a valid selector.`,
					});
				}
				const nodeName = match.groups.node;
				const attrName = match.groups.attr;
				const val = match.groups.value;

				switch (driver.capabilities.platformName) {
					case PlatformName.iOS:
						if (this.isIOSAttr(attrName)) {
							if (nodeName !== undefined) {
								this.assertIOSNode(nodeName);
								this.node = `XCUIElementType${IOSNode[nodeName]}`;
							}
							this.predicates.push(IOSPredicates[attrName].replace("*value*", val));
						}
						break;
					case PlatformName.Android:
						if (this.isAndroidAttr(attrName)) {
							if (nodeName !== undefined) {
								this.assertAndroidNode(nodeName);
								this.node = `android.${AndroidNode[nodeName]}`;
							}
							this.predicates.push(AndroidPredicates[attrName].replace("*value*", val));
						}
						break;
				}
				break;
			}
			case "object":
				for (const s of selector) {
					this.selector = s;
				}
				break;
		}
	}

	private isIOSAttr(attrName: string): attrName is keyof typeof IOSPredicates {
		return Object.keys(IOSPredicates).includes(attrName);
	}

	private isAndroidAttr(attrName: string): attrName is keyof typeof AndroidPredicates {
		return Object.keys(AndroidPredicates).includes(attrName);
	}

	private assertIOSNode(nodeName: string): asserts nodeName is keyof typeof IOSNode {
		if (Object.keys(IOSNode).includes(nodeName)) {
			return;
		}
		throw new XBridgeServiceError({
			name: Exception.InvalidAttribute,
			message: `Invalid iOS node: "${nodeName}". Expected one of [${Object.keys(IOSNode).join(", ")}].`,
		});
	}

	private assertAndroidNode(nodeName: string): asserts nodeName is keyof typeof AndroidNode {
		if (Object.keys(AndroidNode).includes(nodeName)) {
			return;
		}
		throw new XBridgeServiceError({
			name: Exception.InvalidAttribute,
			message: `Invalid Android node: "${nodeName}". Expected one of [${Object.keys(AndroidNode).join(", ")}].`,
		});
	}

	private get context(): string | undefined {
		return this._context;
	}

	private set context(ctx: string | undefined) {
		if (ctx !== undefined) {
			this._context = ctx;

			const match = ctx.match(this.INDEX_PATTERN);
			if (match?.groups) {
				this._context = match.groups.selector;
			}
		}
	}
}

class Locator {
	private platformScope?: PlatformName;
	private swipeEnabled: boolean = false;

	public locator: string;

	constructor(locator: string) {
		log.debug(`[Locator.constructor] Selector: ${locator}`);
		this.locator = locator;
	}

	private scopeCheck(): boolean {
		const scopeCheck = this.platformScope !== undefined && this.platformScope === driver.capabilities.platformName;
		this.platformScope &&= undefined;
		return scopeCheck;
	}

	private async swipeMotion() {
		if (!this.swipeEnabled) {
			return;
		}

		const MAX_SWIPE_ATTEMPTS = 5;
		const SWIPE_DIRECTION = "up";
		const SWIPE_DURATION = 500;

		if (await $(this.locator).isDisplayed()) {
			return;
		}

		const windowSize = await driver.getWindowSize();

		log.info("Element not in viewport, attempting to swipe into view");
		for (let attempts = 1; attempts <= MAX_SWIPE_ATTEMPTS; attempts++) {
			log.debug(`[Locator.swipe] Attempt ${attempts}/${MAX_SWIPE_ATTEMPTS}`);
			await driver.swipe({
				direction: SWIPE_DIRECTION,
				duration: SWIPE_DURATION,
				from: {
					x: windowSize.width * 0.5,
					y: windowSize.height * 0.4,
				},
				to: {
					x: windowSize.width * 0.5,
					y: windowSize.height * 0.1,
				},
			});
			if (await $(this.locator).isDisplayed()) {
				log.info("Element brought into view");
				return;
			}
		}

		throw new XBridgeServiceError({
			name: Exception.NotDisplayedAfterSwipe,
			message: `Element not found after ${MAX_SWIPE_ATTEMPTS} swipe attempts.`,
		});
	}

	get ios(): Locator {
		this.platformScope = PlatformName.iOS;
		return this;
	}

	get android(): Locator {
		this.platformScope = PlatformName.Android;
		return this;
	}

	get swipe(): Locator {
		this.swipeEnabled = true;
		return this;
	}

	async click(): Promise<void> {
		await this.swipeMotion();
		log.debug("[Locator.click]");
		await $(`(${this.locator})[1]`).click();
	}

	async fill(val: string): Promise<void> {
		await this.swipeMotion();
		log.debug(`[Locator.fill] Value: "${val}"`);
		await $(`(${this.locator})[1]`).setValue(val);
	}

	ancestor(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Ancestor,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.ancestor] Selector: "${this.locator}"`);
		return this;
	}

	descendant(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Descendant,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.descendant] Selector: "${this.locator}"`);
		return this;
	}

	parent(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Parent,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.parent] Selector: "${this.locator}"`);
		return this;
	}

	child(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Child,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.child] Selector: "${this.locator}"`);
		return this;
	}

	previous(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Preceding,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.previous] Selector: "${this.locator}"`);
		return this;
	}

	next(selector: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Following,
			selector,
		});
		this.locator = xpath.selector;
		log.debug(`[Locator.next] Selector: "${this.locator}"`);
		return this;
	}
}

export function XBridge(selector: Selector): Locator {
	const xpath = new XPathConstructor({ selector });
	return new Locator(xpath.selector);
}
