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

enum NavigationAxis {
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
	| `${keyof typeof IOSNode}`
	| `${keyof typeof IOSPredicates}="${string}"`
	| `${keyof typeof IOSPredicates}='${string}'`
	| `${keyof typeof IOSNode}[${keyof typeof IOSPredicates}="${string}"]`
	| `${keyof typeof IOSNode}[${keyof typeof IOSPredicates}='${string}']`;

type AndroidSelector =
	| `${keyof typeof AndroidNode}`
	| `${keyof typeof AndroidPredicates}="${string}"`
	| `${keyof typeof AndroidPredicates}='${string}'`
	| `${keyof typeof AndroidNode}[${keyof typeof AndroidPredicates}="${string}"]`
	| `${keyof typeof AndroidNode}[${keyof typeof AndroidPredicates}='${string}']`;

type Selector = IOSSelector | AndroidSelector | [IOSSelector, AndroidSelector] | [AndroidSelector, IOSSelector];

interface XPathParams {
	context?: string;
	axis?: NavigationAxis;
	selector?: Selector;
}

type ParseResult = [
	keyof typeof IOSNode | keyof typeof AndroidNode,
	keyof typeof IOSPredicates | keyof typeof AndroidPredicates,
	string,
];

enum Exception {
	UnknownPlatform = "UnknownPlatformError",
	SelectorRequired = "SelectorRequiredError",
	InvalidSelector = "InvalidSelectorError",
	InvalidNode = "InvalidNodeError",
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

function verifySupportedPlatform(platformName: string) {
	if (!Object.values<string>(PlatformName).includes(platformName)) {
		throw new XBridgeServiceError({
			name: Exception.UnknownPlatform,
			message: `Unsupported platform: "${platformName}". Must be one of [${Object.keys(PlatformName).join(", ")}].`,
		});
	}
}

class XPathConstructor {
	private readonly NODE_PATTERN = /^(?<node>\w+)$/;
	private readonly ATTR_PATTERN = /^(?<attr>\w+)=['"](?<value>.+)['"]$/;
	private readonly NODE_ATTR_PATTERN = /^(?<node>\w+)\[(?<attr>\w+)=['"](?<value>.+)['"]\]$/;
	private readonly SELECTOR_PATTERN = new RegExp(
		`^(?:${this.NODE_PATTERN.source}|${this.ATTR_PATTERN.source}|${this.NODE_ATTR_PATTERN.source})$`,
	);

	private context?: string;
	private axis?: NavigationAxis;
	private node?: XCUIElementType | AndroidElementClass;
	private predicates: string[] = [];

	constructor({ context, axis, selector }: XPathParams) {
		this.context = context;
		this.axis = axis;
		this.selector = selector;

		if (this.isRoot && !this.hasNode && !this.predicates.length) {
			throw new XBridgeServiceError({
				name: Exception.SelectorRequired,
				message: "No selector found for the current platform.",
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

	get selector(): string {
		let selector = "";

		selector += this.isRoot ? "//" : this.hasNavigation ? `${this.context}${this.axis}` : this.context;

		selector += this.hasNode ? this.node : "*";

		selector += this.predicates.join("");

		return selector;
	}

	private set selector(selector: Selector | undefined) {
		switch (typeof selector) {
			case "string": {
				const [node, attr, value] = this.parseMatch(selector.match(this.SELECTOR_PATTERN));
				switch (driver.capabilities.platformName) {
					case PlatformName.iOS:
						if (node !== undefined && this.isIOSNode(node)) {
							this.node = `XCUIElementType${IOSNode[node]}`;
						}
						if (attr !== undefined && this.isIOSAttr(attr)) {
							this.predicates.push(IOSPredicates[attr].replace("*value*", value));
						}
						break;
					case PlatformName.Android:
						if (node !== undefined && this.isAndroidNode(node)) {
							this.node = `android.${AndroidNode[node]}`;
						}
						if (attr !== undefined && this.isAndroidAttr(attr)) {
							this.predicates.push(AndroidPredicates[attr].replace("*value*", value));
						}
						break;
				}
				break;
			}
			case "object":
				if (selector.length > 2) {
					throw new XBridgeServiceError({
						name: Exception.InvalidSelector,
						message: "Provide at most contain at ost 2 entries.",
					});
				}
				for (const s of selector) {
					this.selector = s;
				}
				break;
		}
	}

	private parseMatch(match: RegExpMatchArray | null): ParseResult {
		if (match?.groups === undefined) {
			throw new XBridgeServiceError({
				name: Exception.InvalidSelector,
				message: `Selector format is invalid. Use '<node>', '<attr>="<value>"', or '<node>[<attr>="<value>"]'.`,
			});
		}
		const [node, attr, value] = [match.groups.node, match.groups.attr, match.groups.value];
		if (node !== undefined) {
			if (!this.isIOSNode(node) && !this.isAndroidNode(node)) {
				throw new XBridgeServiceError({
					name: Exception.InvalidNode,
					message: `Unknown node: "${node}".`,
				});
			}
		}
		if (attr !== undefined) {
			if (!this.isIOSAttr(attr) && !this.isAndroidAttr(attr)) {
				throw new XBridgeServiceError({
					name: Exception.InvalidAttribute,
					message: `Unknown attribute: "${attr}".`,
				});
			}
			if (node !== undefined) {
				if (
					(!this.isIOSNode(node) && this.isIOSAttr(attr)) ||
					(!this.isAndroidNode(node) && this.isAndroidAttr(attr))
				) {
					throw new XBridgeServiceError({
						name: Exception.InvalidSelector,
						message: `Node "${node}" and attribute "${attr}" don't belong to the same platform.`,
					});
				}
			}
			if (value === undefined) {
				throw new XBridgeServiceError({
					name: Exception.InvalidSelector,
					message: `Missing value for attribute "${attr}".`,
				});
			}
		}
		return [node, attr, value];
	}

	private isIOSNode(node: string): node is keyof typeof IOSNode {
		return Object.keys(IOSNode).includes(node);
	}

	private isIOSAttr(attr: string): attr is keyof typeof IOSPredicates {
		return Object.keys(IOSPredicates).includes(attr);
	}

	private isAndroidNode(node: string): node is keyof typeof AndroidNode {
		return Object.keys(AndroidNode).includes(node);
	}

	private isAndroidAttr(attr: string): attr is keyof typeof AndroidPredicates {
		return Object.keys(AndroidPredicates).includes(attr);
	}
}

class Locator {
	private platformScope?: PlatformName;
	public locator: string;

	constructor(selector: Selector) {
		const xpath = new XPathConstructor({ selector });
		this.locator = xpath.selector;
	}

	private scopeCheck(): boolean {
		const scopeCheck = this.platformScope !== undefined && this.platformScope === driver.capabilities.platformName;
		this.platformScope &&= undefined;
		return scopeCheck;
	}

	get ios(): Locator {
		this.platformScope = PlatformName.iOS;
		log.debug("PLATFORM iOS");
		return this;
	}

	get android(): Locator {
		this.platformScope = PlatformName.Android;
		log.debug("PLATFORM Android");
		return this;
	}

	ancestor(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION ancestor");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Ancestor,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}

	descendant(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION descendant");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Descendant,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}

	parent(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION parent");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Parent,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}

	child(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION child");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Child,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}

	previous(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION previous");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Preceding,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}

	next(selector?: Selector): Locator {
		if (!this.scopeCheck()) {
			return this;
		}
		log.debug("NAVIGATION next");
		const xpath = new XPathConstructor({
			context: this.locator,
			axis: NavigationAxis.Following,
			selector,
		});
		this.locator = xpath.selector;
		return this;
	}
}

export { NavigationAxis, type Selector, Exception, verifySupportedPlatform, XPathConstructor, Locator };
