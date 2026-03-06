# API Reference

## Selectors

| Pattern | Example |
|---|---|
| `<node>` | `'button'` |
| `<attr>="<value>"` | `'label="Add to cart"'` |
| `<node>[<attr>="<value>"]` | `'button[label="Add to cart"]'` |

### iOS Nodes

| Alias | XCUIElementType |
|---|---|
| `text` | `XCUIElementTypeStaticText` |
| `button` | `XCUIElementTypeButton` |
| `switch` | `XCUIElementTypeSwitch` |
| `link` | `XCUIElementTypeLink` |
| `input` | `XCUIElementTypeTextField` |
| `textarea` | `XCUIElementTypeTextView` |
| `secureinput` | `XCUIElementTypeSecureTextField` |
| `image` | `XCUIElementTypeImage` |
| `window` | `XCUIElementTypeWindow` |
| `cell` | `XCUIElementTypeCell` |
| `webview` | `XCUIElementTypeWebView` |
| `collectionview` | `XCUIElementTypeCollectionView` |
| `scrollview` | `XCUIElementTypeScrollView` |
| `other` | `XCUIElementTypeOther` |

### iOS Attributes

| Attribute | XPath predicate |
|---|---|
| `label="<value>"` | `[@label="<value>"]` |
| `labelContains="<value>"` | `[contains(@label, "<value>")]` |
| `value="<value>"` | `[@value="<value>"]` |
| `name="<value>"` | `[@name="<value>"]` |

### Android Nodes

| Alias | Android class |
|---|---|
| `text` | `android.widget.TextView` |
| `button` | `android.widget.Button` |
| `input` | `android.widget.EditText` |
| `image` | `android.widget.Image` |
| `imagebutton` | `android.widget.ImageButton` |
| `imageview` | `android.widget.ImageView` |
| `frame` | `android.widget.FrameLayout` |
| `linear` | `android.widget.LinearLayout` |
| `webview` | `android.widget.WebView` |
| `scrollview` | `android.widget.ScrollView` |
| `view` | `android.view.View` |

### Android Attributes

| Attribute | XPath predicate |
|---|---|
| `text="<value>"` | `[@text="<value>"]` |
| `textContains="<value>"` | `[contains(@text, "<value>")]` |
| `description="<value>"` | `[@content-desc="<value>"]` |
| `resourceId="<value>"` | `[@resource-id="<value>"]` |

---

## Navigation

| Method | XPath axis |
|---|---|
| `.ancestor(selector?)` | `/ancestor::` |
| `.descendant(selector?)` | `/descendant::` |
| `.parent(selector?)` | `/parent::` |
| `.child(selector?)` | `/child::` |
| `.previous(selector?)` | `/preceding-sibling::` |
| `.next(selector?)` | `/following-sibling::` |

When called without a `selector`, the navigation step matches any node (`*`).
