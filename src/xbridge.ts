import {
  PlatformName,
  AndroidAttr,
  AndroidElementClass,
  AndroidNodeType,
  AndroidPredicates,
  IOSAttr,
  XCUIElementType,
  IOSNodeType,
  IOSPredicates,
  NavigationAxis,
  NavigationParams,
  SelectorParams,
  Exception,
} from "./types"

class XBridgeServiceError extends Error {
  constructor(err: { name: Exception, message: string }) {
    super(`[wdio-xbridge-service]: ${err.message}`)
    this.name = err.name
  }
}

export function verifySuportedPlatform(platformName: string) {
  if (!Object.values<string>(PlatformName).includes(platformName)) {
    throw new XBridgeServiceError({
      name: Exception.UnknownPlatform,
      message: "Current platform is not supported.",
    })
  }
}

class XPathConstructur {
  private INDEX_PATTERN = /^\((?<selector>.+)\)\[\d+\]$/

  private _context?: string
  private _position?: `[${number}]` | "[last()]"

  axis?: NavigationAxis
  node!: XCUIElementType | AndroidElementClass
  predicates: string[] = []

  constructor({ context, axis, position, ...attributes }: SelectorParams) {
    this.context = context
    this.axis = axis

    if (this.isRoot && this.hasNavigation) {
      throw new XBridgeServiceError({
        name: Exception.ContextNotFound,
        message: "No starting point was provided for the navigation.",
      })
    }

    for (const [attribute, value] of Object.entries(attributes)) {
      if (value !== undefined) {
        this.parseAttr(attribute, value as string)
      }
    }

    this.position = position

    if (this.isRoot && !this.predicates.length && this.isAnyNodeType) {
      throw new XBridgeServiceError({
        name: Exception.RequiredAttribute,
        message: "No attributes were specified for the current platform."
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
      message: `The provided value for 'position' "${val} is invalid.`,
    })
  }

  private parseAttr(attr: string, val: string) {
    switch (driver.capabilities.platformName) {
      case PlatformName.iOS:
        if (this.isIOSAttr(attr)) {
          if (this.isNodeAttr(attr)) {
            this.assertIOSNodeType(val)
            this.node = `XCUIElementType${val}`
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
            this.node = `android.${val}`
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

  private assertIOSNodeType(val: string): asserts val is IOSNodeType {
    const nodeType = val as IOSNodeType

    if (Object.values(IOSNodeType).includes(nodeType)) {
      return
    }

    throw new XBridgeServiceError({
      name: Exception.InvalidNodeType,
      message: `The provided value for 'type' "${val}" is invalid.`
    })
  }

  private assertAndroidNodeType(val: string): asserts val is AndroidNodeType {
    const nodeType = val as AndroidNodeType

    if (Object.values(AndroidNodeType).includes(nodeType)) {
      return
    }

    throw new XBridgeServiceError({
      name: Exception.InvalidNodeType,
      message: `The provided value for 'class' "${val}" is invalid.`
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

class Element {
  private selector: string
  private platformScope?: PlatformName
  private swipeEnabled: boolean = false

  constructor(selector: string) {
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

    for (let attempts = 1; attempts <= MAX_SWIPE_ATTEMPTS; attempts++) {
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
        return
      }
    }

    throw new XBridgeServiceError({
      name: Exception.NotDisplayedAfterSwipe,
      message: "Element could not be brought into view via swipe.",
    })
  }

  get ios(): Element {
    this.platformScope = PlatformName.iOS
    return this
  }

  get android(): Element {
    this.platformScope = PlatformName.Android
    return this
  }

  get swipe(): Element {
    this.swipeEnabled = true
    return this
  }

  async find(index: number = 1): Promise<WebdriverIO.Element> {
    this.selector = `(${this.selector})[${index}]`
    await this.swipeMotion()
    return await $(this.selector).getElement()
  }

  async findAll(): Promise<WebdriverIO.ElementArray> {
    await this.swipeMotion()
    return await $$(this.selector).getElements()
  }

  ancestor(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Ancestor,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }

  descendant(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Descendant,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }

  parent(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Parent,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }

  child(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Child,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }

  previous(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Preceding,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }

  next(params?: NavigationParams): Element {
    if (!this.scopeCheck()) {
      return this
    }
    const xpath = new XPathConstructur({
      context: this.selector,
      axis: NavigationAxis.Following,
      ...params,
    })
    this.selector = xpath.selector
    return this
  }
}

export function XBridge(attrs: IOSAttr & AndroidAttr): Element {
  const xpath = new XPathConstructur(attrs)
  return new Element(xpath.selector)
}