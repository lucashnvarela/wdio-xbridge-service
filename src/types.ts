export enum PlatformName {
  iOS = "iOS",
  Android = "Android",
}

export enum IOSNodeType {
  Text = "StaticText",
  Button = "Button",
  Input = "TextField",
}

export enum AndroidNodeType {
  Text = "widget.TextView",
  Button = "widget.Button",
  Input = "widget.EditText",
}

export enum NavigationAxis {
  Ancestor = "/ancestor::",
  Descendant = "/descendant::",
  Parent = "/parent::",
  Child = "/child::",
  Preceding = "/preceding-sibling::",
  Following = "/following-sibling::",
}

export type XCUIElementType = `XCUIElementType${IOSNodeType}`

export type AndroidElementClass = `android.${AndroidNodeType}`

export interface IOSAttr {
  label?: string
  labelContains?: string
  value?: string
  name?: string
  type?: `${IOSNodeType}`
}

export enum IOSPredicates {
  label = '[@label="*value*"]',
  labelContains = '[contains(@label, "*value*")]',
  value = '[@value="*value*"]',
  name = '[@name="*value*"]',
}

export interface AndroidAttr {
  resourceId?: string
  text?: string
  textContains?: string
  description?: string
  class?: AndroidNodeType
}

export enum AndroidPredicates {
  resourceId = '[@resource-id="*value*"]',
  text = '[@text="*value*"]',
  textContains = '[contains(@text, "*value*")]',
  description = '[@content-desc="*value*"]',
}

export interface NavigationParams extends IOSAttr, AndroidAttr {
  position?: number
}

export interface SelectorParams extends NavigationParams {
  context?: string
  axis?: NavigationAxis
}

export enum Exception {
  ContextNotFound = "ContextNotFoundError",
  RequiredAttribute = "RequiredAttributeError",
  UnknownPlatform = "UnknownPlatformError",
  InvalidAttribute = "InvalidAttributeError",
  InvalidNodeType = "InvalidNodeTypeError",
  NotDisplayedAfterSwipe = "NotDisplayedAfterSwipe",
}