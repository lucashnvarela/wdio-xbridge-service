import logger from "@wdio/logger"

enum PlatformName {
  iOS = "iOS",
  Android = "Android",
}

enum IOSNodeType {
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

enum AndroidNodeType {
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

type XCUIElementType = `XCUIElementType${IOSNodeType}`

type AndroidElementClass = `android.${AndroidNodeType}`

interface IOSAttr {
  label?: string
  labelContains?: string
  value?: string
  name?: string
  type?: keyof typeof IOSNodeType
}

enum IOSPredicates {
  label = '[@label="*value*"]',
  labelContains = '[contains(@label, "*value*")]',
  value = '[@value="*value*"]',
  name = '[@name="*value*"]',
}

interface AndroidAttr {
  resourceId?: string
  text?: string
  textContains?: string
  description?: string
  class?: keyof typeof AndroidNodeType
}

enum AndroidPredicates {
  resourceId = '[@resource-id="*value*"]',
  text = '[@text="*value*"]',
  textContains = '[contains(@text, "*value*")]',
  description = '[@content-desc="*value*"]',
}

interface NavigationParams extends IOSAttr, AndroidAttr {
  position?: number
}

interface SelectorParams extends NavigationParams {
  context?: string
  axis?: NavigationAxis
}

enum Exception {
  AttributeRequired = "AttributeRequiredError",
  UnknownPlatform = "UnknownPlatformError",
  InvalidAttribute = "InvalidAttributeError",
  NotDisplayedAfterSwipe = "NotDisplayedAfterSwipeError",
}

const log = logger("wdio-xbridge-service")

class XBridgeServiceError extends Error {
  constructor(err: { name: Exception, message: string }) {
    log.error(err.message)
    super(err.message)
    this.name = err.name
  }
}

export function verifySupportedPlatform(platformName: string) {
  if (!Object.values<string>(PlatformName).includes(platformName)) {
    throw new XBridgeServiceError({
      name: Exception.UnknownPlatform,
      message: `Unsupported platform: "${platformName}". Expected one of [${Object.keys(PlatformName).join(", ")}].`,
    })
  }
}

class XPathConstructor {
  private readonly INDEX_PATTERN = /^\((?<selector>.+)\)\[\d+\]$/

  private _context?: string
  private _position?: `[${number}]` | "[last()]"

  axis?: NavigationAxis
  node?: XCUIElementType | AndroidElementClass
  predicates: string[] = []

  constructor({ context, axis, position, ...attributes }: SelectorParams) {
    this.context = context
    this.axis = axis

    for (const [attribute, value] of Object.entries(attributes)) {
      if (value !== undefined) {
        this.parseAttr(attribute, value)
      }
    }

    this.position = position

    if (this.isRoot && !this.predicates.length && this.isAnyNodeType) {
      throw new XBridgeServiceError({
        name: Exception.AttributeRequired,
        message: "At least one attribute must be specified to build a valid selector."
      })
    }
  }

  get isRoot(): boolean {
    return this.context === undefined
  }

  get hasNavigation(): boolean {
    return this.axis !== undefined
  }

  get hasNode(): boolean {
    return this.node !== undefined
  }

  get isAnyNodeType(): boolean {
    return !this.hasNode && (this.isRoot || this.hasNavigation)
  }

  get context(): string | undefined {
    return this._context
  }

  set context(ctx: string | undefined) {
    if (ctx !== undefined) {
      this._context = ctx

      const match = ctx.match(this.INDEX_PATTERN)?.groups
      if (match !== undefined && match.selector) {
        this._context = match.selector
      }
    }
  }

  get position(): `[${number}]` | "[last()]" | undefined {
    return this._position
  }

  set position(val: number | undefined) {
    switch (typeof val) {
      case "number":
        if (val < -1) {
          break
        }
        if (val >= 0) {
          this._position = `[${val}]`
          return
        }
        this._position = "[last()]"
        return
      case "undefined":
        return
    }
    throw new XBridgeServiceError({
      name: Exception.InvalidAttribute,
      message: `Invalid position value: "${val}". Expected a number >= -1.`,
    })
  }

  private parseAttr(attr: string, val: string) {
    switch (driver.capabilities.platformName) {
      case PlatformName.iOS:
        if (this.isIOSAttr(attr)) {
          if (this.isNodeAttr(attr)) {
            this.assertIOSNodeType(val)
            this.node = `XCUIElementType${IOSNodeType[val]}`
            break
          }
          const predicatePattern = IOSPredicates[attr]
          const predicate = predicatePattern.replace("*value*", val)
          this.predicates.push(predicate)
        }
        break
      case PlatformName.Android:
        if (this.isAndroidAttr(attr)) {
          if (this.isNodeAttr(attr)) {
            this.assertAndroidNodeType(val)
            this.node = `android.${AndroidNodeType[val]}`
            break
          }
          const predicatePattern = AndroidPredicates[attr]
          const predicate = predicatePattern.replace("*value*", val)
          this.predicates.push(predicate)
        }
        break
    }
  }

  private isIOSAttr(attr: string): attr is keyof typeof IOSPredicates | "type" {
    return [...Object.keys(IOSPredicates), "type"].includes(attr)
  }

  private isAndroidAttr(attr: string): attr is keyof typeof AndroidPredicates | "class" {
    return [...Object.keys(AndroidPredicates), "class"].includes(attr)
  }

  private isNodeAttr(attr: string): attr is "type" | "class" {
    return ["type", "class"].includes(attr)
  }

  private assertIOSNodeType(val: string): asserts val is keyof typeof IOSNodeType {
    if (Object.keys(IOSNodeType).includes(val)) {
      return
    }
    throw new XBridgeServiceError({
      name: Exception.InvalidAttribute,
      message: `Invalid iOS node type: "${val}". Expected one of [${Object.keys(IOSNodeType).join(", ")}].`,
    })
  }

  private assertAndroidNodeType(val: string): asserts val is keyof typeof AndroidNodeType {
    if (Object.keys(AndroidNodeType).includes(val)) {
      return
    }
    throw new XBridgeServiceError({
      name: Exception.InvalidAttribute,
      message: `Invalid Android node type: "${val}". Expected one of [${Object.keys(AndroidNodeType).join(", ")}].`,
    })
  }

  get selector(): string {
    let selector = ""

    selector += this.isRoot ? "//" : this.hasNavigation ? `${this.context}${this.axis}` : this.context

    selector += this.hasNode ? this.node : this.isAnyNodeType ? "*" : ""

    selector += this.predicates.join("")

    selector += this.position ?? ""

    return selector
  }
}

class Locator {
  private selector: string
  private platformScope?: PlatformName
  private swipeEnabled: boolean = false

  constructor(selector: string) {
    log.debug(`[Locator.constructor] Selector: ${selector}`)
    this.selector = selector
  }

  private scopeCheck(): boolean {
    const scopeCheck = this.platformScope !== undefined && this.platformScope === driver.capabilities.platformName
    this.platformScope &&= undefined
    return scopeCheck
  }

  private async swipeMotion() {
    if (!this.swipeEnabled) {
      return
    }

    const MAX_SWIPE_ATTEMPTS = 5
    const SWIPE_DIRECTION = "up"
    const SWIPE_DURATION = 500

    if (await $(this.selector).isDisplayed()) {
      return
    }

    const windowSize = await driver.getWindowSize()

    log.info("Element not in viewport, attempting to swipe into view")
    for (let attempts = 1; attempts <= MAX_SWIPE_ATTEMPTS; attempts++) {
      log.debug(`[Locator.swipe] Attempt ${attempts}/${MAX_SWIPE_ATTEMPTS}`)
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
        }
      })
      if (await $(this.selector).isDisplayed()) {
        log.info("Element brought into view")
        return
      }
    }

    throw new XBridgeServiceError({
      name: Exception.NotDisplayedAfterSwipe,
      message: `Element not found after ${MAX_SWIPE_ATTEMPTS} swipe attempts.`,
    })
  }

  get ios(): Locator {
    this.platformScope = PlatformName.iOS
    return this
  }

  get android(): Locator {
    this.platformScope = PlatformName.Android
    return this
  }

  get swipe(): Locator {
    this.swipeEnabled = true
    return this
  }

  async click(): Promise<void> {
    await this.swipeMotion()
    log.debug("[Locator.click]")
    await $(this.selector).click()
  }

  async fill(val: string): Promise<void> {
    await this.swipeMotion()
    log.debug(`[Locator.fill] Value: "${val}"`)
    await $(this.selector).setValue(val)
  }

  ancestor(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Ancestor,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.ancestor] Selector: "${this.selector}"`)
    return this
  }

  descendant(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Descendant,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.descendant] Selector: "${this.selector}"`)
    return this
  }

  parent(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Parent,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.parent] Selector: "${this.selector}"`)
    return this
  }

  child(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Child,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.child] Selector: "${this.selector}"`)
    return this
  }

  previous(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Preceding,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.previous] Selector: "${this.selector}"`)
    return this
  }

  next(params?: NavigationParams): Locator {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructor({
      context: this.selector,
      axis: NavigationAxis.Following,
      ...params,
    })
    this.selector = xpath.selector
    log.debug(`[Locator.next] Selector: "${this.selector}"`)
    return this
  }
}

export function XBridge(attrs: IOSAttr & AndroidAttr): Locator {
  const xpath = new XPathConstructor(attrs)
  return new Locator(xpath.selector)
}