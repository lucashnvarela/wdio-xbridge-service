import { beforeAll, describe, expect, it, vi } from "vitest";
import { Exception, NavigationAxis, type Selector, XPathConstructor } from "../src/xbridge";

describe("simple selector", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("builds selector with label", () => {
			const xpath = new XPathConstructor({ selector: 'label="Add to cart"' });
			expect(xpath.selector).toBe('//*[@label="Add to cart"]');
		});

		it("builds selector with labelContains", () => {
			const xpath = new XPathConstructor({
				selector: 'labelContains="Add"',
			});
			expect(xpath.selector).toBe('//*[contains(@label, "Add")]');
		});

		it("builds selector with name", () => {
			const xpath = new XPathConstructor({ selector: 'name="productTitle"' });
			expect(xpath.selector).toBe('//*[@name="productTitle"]');
		});

		it("builds selector with value", () => {
			const xpath = new XPathConstructor({ selector: 'value="1"' });
			expect(xpath.selector).toBe('//*[@value="1"]');
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("builds selector with text", () => {
			const xpath = new XPathConstructor({ selector: 'text="Add to cart"' });
			expect(xpath.selector).toBe('//*[@text="Add to cart"]');
		});

		it("builds selector with textContains", () => {
			const xpath = new XPathConstructor({ selector: 'textContains="Add"' });
			expect(xpath.selector).toBe('//*[contains(@text, "Add")]');
		});

		it("builds selector with resourceId", () => {
			const xpath = new XPathConstructor({ selector: 'resourceId="addToCartBtn"' });
			expect(xpath.selector).toBe('//*[@resource-id="addToCartBtn"]');
		});

		it("builds selector with description", () => {
			const xpath = new XPathConstructor({ selector: 'description="Product image"' });
			expect(xpath.selector).toBe('//*[@content-desc="Product image"]');
		});
	});
});

describe("selectors with node", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("builds selector with button+label", () => {
			const xpath = new XPathConstructor({ selector: 'button[label="Add to cart"]' });
			expect(xpath.selector).toBe('//XCUIElementTypeButton[@label="Add to cart"]');
		});

		it("builds selector with switch+labelContains", () => {
			const xpath = new XPathConstructor({ selector: 'switch[labelContains="Notify me"]' });
			expect(xpath.selector).toBe('//XCUIElementTypeSwitch[contains(@label, "Notify me")]');
		});

		it("builds selector with text+name", () => {
			const xpath = new XPathConstructor({ selector: 'text[name="productTitle"]' });
			expect(xpath.selector).toBe('//XCUIElementTypeStaticText[@name="productTitle"]');
		});

		it("builds selector with input+value", () => {
			const xpath = new XPathConstructor({ selector: 'input[value="1"]' });
			expect(xpath.selector).toBe('//XCUIElementTypeTextField[@value="1"]');
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("builds selector with button+text", () => {
			const xpath = new XPathConstructor({ selector: 'button[text="Add to cart"]' });
			expect(xpath.selector).toBe('//android.widget.Button[@text="Add to cart"]');
		});

		it("builds selector with imageview+description", () => {
			const xpath = new XPathConstructor({ selector: 'imageview[description="Product image"]' });
			expect(xpath.selector).toBe('//android.widget.ImageView[@content-desc="Product image"]');
		});

		it("builds selector with input+resourceId", () => {
			const xpath = new XPathConstructor({ selector: 'input[resourceId="quantityInput"]' });
			expect(xpath.selector).toBe('//android.widget.EditText[@resource-id="quantityInput"]');
		});

		it("builds selector with text+description", () => {
			const xpath = new XPathConstructor({ selector: 'text[description="Product rating"]' });
			expect(xpath.selector).toBe('//android.widget.TextView[@content-desc="Product rating"]');
		});
	});
});

describe("single-quote selectors", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("builds selector with single-quoted value", () => {
			const xpath = new XPathConstructor({ selector: "button[label='Add to cart']" });
			expect(xpath.selector).toBe('//XCUIElementTypeButton[@label="Add to cart"]');
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("builds selector with single-quoted value", () => {
			const xpath = new XPathConstructor({ selector: "button[text='Add to cart']" });
			expect(xpath.selector).toBe('//android.widget.Button[@text="Add to cart"]');
		});
	});
});

describe("values with spaces", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("builds selector with multi-word value", () => {
			const xpath = new XPathConstructor({ selector: 'label="Sign In"' });
			expect(xpath.selector).toBe('//*[@label="Sign In"]');
		});

		it("builds selector with multi-word value using single quotes", () => {
			const xpath = new XPathConstructor({ selector: "label='Sign In'" });
			expect(xpath.selector).toBe('//*[@label="Sign In"]');
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("builds selector with multi-word value", () => {
			const xpath = new XPathConstructor({ selector: 'text="Sign In"' });
			expect(xpath.selector).toBe('//*[@text="Sign In"]');
		});

		it("builds selector with multi-word value using single quotes", () => {
			const xpath = new XPathConstructor({ selector: "text='Sign In'" });
			expect(xpath.selector).toBe('//*[@text="Sign In"]');
		});
	});
});

describe("array selector", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("builds selector with label, ignores text", () => {
			const xpath = new XPathConstructor({
				selector: ['label="Add to cart"', 'text="Add to cart"'],
			});
			expect(xpath.selector).toBe('//*[@label="Add to cart"]');
		});

		it("builds selector with name, ignores resourceId", () => {
			const xpath = new XPathConstructor({
				selector: ['name="productTitle"', 'resourceId="productTitle"'],
			});
			expect(xpath.selector).toBe('//*[@name="productTitle"]');
		});

		it("builds selector with button+label, ignores button+text", () => {
			const xpath = new XPathConstructor({
				selector: ['button[label="Add to cart"]', 'button[text="Add to cart"]'],
			});
			expect(xpath.selector).toBe('//XCUIElementTypeButton[@label="Add to cart"]');
		});

		it("builds selector with input+name, ignores input+resourceId", () => {
			const xpath = new XPathConstructor({
				selector: ['input[name="quantityInput"]', 'input[resourceId="quantityInput"]'],
			});
			expect(xpath.selector).toBe('//XCUIElementTypeTextField[@name="quantityInput"]');
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("builds selector with text, ignores label", () => {
			const xpath = new XPathConstructor({
				selector: ['label="Add to cart"', 'text="Add to cart"'],
			});
			expect(xpath.selector).toBe('//*[@text="Add to cart"]');
		});

		it("builds selector with resourceId, ignores name", () => {
			const xpath = new XPathConstructor({
				selector: ['name="productTitle"', 'resourceId="productTitle"'],
			});
			expect(xpath.selector).toBe('//*[@resource-id="productTitle"]');
		});

		it("builds selector with button+text, ignores button+label", () => {
			const xpath = new XPathConstructor({
				selector: ['button[label="Add to cart"]', 'button[text="Add to cart"]'],
			});
			expect(xpath.selector).toBe('//android.widget.Button[@text="Add to cart"]');
		});

		it("builds selector with input+resourceId, ignores input+name", () => {
			const xpath = new XPathConstructor({
				selector: ['input[name="quantityInput"]', 'input[resourceId="quantityInput"]'],
			});
			expect(xpath.selector).toBe('//android.widget.EditText[@resource-id="quantityInput"]');
		});
	});
});

describe("navigation axis", () => {
	describe("simple selector", () => {
		describe("iOS", () => {
			const context = '//XCUIElementTypeButton[@label="Add to cart"]';

			beforeAll(() => {
				vi.stubGlobal("driver", {
					capabilities: {
						platformName: "iOS",
					},
				});
			});

			it("builds descendant selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Descendant,
					selector: 'label="Add to cart"',
				});
				expect(xpath.selector).toBe(
					'//XCUIElementTypeButton[@label="Add to cart"]/descendant::*[@label="Add to cart"]',
				);
			});

			it("builds ancestor selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Ancestor,
					selector: 'label="Product details"',
				});
				expect(xpath.selector).toBe(
					'//XCUIElementTypeButton[@label="Add to cart"]/ancestor::*[@label="Product details"]',
				);
			});

			it("builds parent selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Parent,
					selector: 'label="Product details"',
				});
				expect(xpath.selector).toBe(
					'//XCUIElementTypeButton[@label="Add to cart"]/parent::*[@label="Product details"]',
				);
			});

			it("builds child selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Child,
					selector: 'label="Add to cart"',
				});
				expect(xpath.selector).toBe('//XCUIElementTypeButton[@label="Add to cart"]/child::*[@label="Add to cart"]');
			});

			it("builds preceding-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Preceding,
					selector: 'label="Wishlist"',
				});
				expect(xpath.selector).toBe(
					'//XCUIElementTypeButton[@label="Add to cart"]/preceding-sibling::*[@label="Wishlist"]',
				);
			});

			it("builds following-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Following,
					selector: 'label="Buy now"',
				});
				expect(xpath.selector).toBe(
					'//XCUIElementTypeButton[@label="Add to cart"]/following-sibling::*[@label="Buy now"]',
				);
			});
		});

		describe("Android", () => {
			const context = '//android.widget.Button[@text="Add to cart"]';

			beforeAll(() => {
				vi.stubGlobal("driver", {
					capabilities: {
						platformName: "Android",
					},
				});
			});

			it("builds descendant selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Descendant,
					selector: 'text="Add to cart"',
				});
				expect(xpath.selector).toBe('//android.widget.Button[@text="Add to cart"]/descendant::*[@text="Add to cart"]');
			});

			it("builds ancestor selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Ancestor,
					selector: 'description="Product details"',
				});
				expect(xpath.selector).toBe(
					'//android.widget.Button[@text="Add to cart"]/ancestor::*[@content-desc="Product details"]',
				);
			});

			it("builds parent selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Parent,
					selector: 'description="Product details"',
				});
				expect(xpath.selector).toBe(
					'//android.widget.Button[@text="Add to cart"]/parent::*[@content-desc="Product details"]',
				);
			});

			it("builds child selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Child,
					selector: 'text="Add to cart"',
				});
				expect(xpath.selector).toBe('//android.widget.Button[@text="Add to cart"]/child::*[@text="Add to cart"]');
			});

			it("builds preceding-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Preceding,
					selector: 'text="Wishlist"',
				});
				expect(xpath.selector).toBe(
					'//android.widget.Button[@text="Add to cart"]/preceding-sibling::*[@text="Wishlist"]',
				);
			});

			it("builds following-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Following,
					selector: 'text="Buy now"',
				});
				expect(xpath.selector).toBe(
					'//android.widget.Button[@text="Add to cart"]/following-sibling::*[@text="Buy now"]',
				);
			});
		});
	});

	describe("selector with node", () => {
		describe("iOS", () => {
			const context = '//XCUIElementTypeButton[@label="Add to cart"]';

			beforeAll(() => {
				vi.stubGlobal("driver", {
					capabilities: {
						platformName: "iOS",
					},
				});
			});

			it("builds descendant selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Descendant,
					selector: 'text[name="productTitle"]',
				});
				expect(xpath.selector).toBe(`${context}/descendant::XCUIElementTypeStaticText[@name="productTitle"]`);
			});

			it("builds ancestor selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Ancestor,
					selector: 'cell[label="Product details"]',
				});
				expect(xpath.selector).toBe(`${context}/ancestor::XCUIElementTypeCell[@label="Product details"]`);
			});

			it("builds parent selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Parent,
					selector: 'cell[label="Product details"]',
				});
				expect(xpath.selector).toBe(`${context}/parent::XCUIElementTypeCell[@label="Product details"]`);
			});

			it("builds child selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Child,
					selector: 'button[label="Add to cart"]',
				});
				expect(xpath.selector).toBe(`${context}/child::XCUIElementTypeButton[@label="Add to cart"]`);
			});

			it("builds preceding-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Preceding,
					selector: 'button[label="Wishlist"]',
				});
				expect(xpath.selector).toBe(`${context}/preceding-sibling::XCUIElementTypeButton[@label="Wishlist"]`);
			});

			it("builds following-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Following,
					selector: 'button[label="Buy now"]',
				});
				expect(xpath.selector).toBe(`${context}/following-sibling::XCUIElementTypeButton[@label="Buy now"]`);
			});
		});

		describe("Android", () => {
			const context = '//android.widget.Button[@text="Add to cart"]';

			beforeAll(() => {
				vi.stubGlobal("driver", {
					capabilities: {
						platformName: "Android",
					},
				});
			});

			it("builds descendant selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Descendant,
					selector: 'text[text="Product title"]',
				});
				expect(xpath.selector).toBe(`${context}/descendant::android.widget.TextView[@text="Product title"]`);
			});

			it("builds ancestor selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Ancestor,
					selector: 'frame[description="Product details"]',
				});
				expect(xpath.selector).toBe(`${context}/ancestor::android.widget.FrameLayout[@content-desc="Product details"]`);
			});

			it("builds parent selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Parent,
					selector: 'frame[description="Product details"]',
				});
				expect(xpath.selector).toBe(`${context}/parent::android.widget.FrameLayout[@content-desc="Product details"]`);
			});

			it("builds child selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Child,
					selector: 'button[text="Add to cart"]',
				});
				expect(xpath.selector).toBe(`${context}/child::android.widget.Button[@text="Add to cart"]`);
			});

			it("builds preceding-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Preceding,
					selector: 'button[text="Wishlist"]',
				});
				expect(xpath.selector).toBe(`${context}/preceding-sibling::android.widget.Button[@text="Wishlist"]`);
			});

			it("builds following-sibling selector", () => {
				const xpath = new XPathConstructor({
					context,
					axis: NavigationAxis.Following,
					selector: 'button[text="Buy now"]',
				});
				expect(xpath.selector).toBe(`${context}/following-sibling::android.widget.Button[@text="Buy now"]`);
			});
		});
	});
});

describe("error cases", () => {
	describe("iOS", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "iOS",
				},
			});
		});

		it("throws InvalidSelectorError when selector is empty", () => {
			expect(() => new XPathConstructor({ selector: "" as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidSelector }),
			);
		});

		it("throws InvalidSelectorError when selector format is invalid", () => {
			expect(() => new XPathConstructor({ selector: "not-valid" as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidSelector }),
			);
		});

		it("throws SelectorRequiredError when selector for the current platform is not provided", () => {
			expect(() => new XPathConstructor({ selector: 'description="Login"' as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.SelectorRequired }),
			);
		});

		it("throws InvalidAttributeError for an invalid iOS node", () => {
			expect(() => new XPathConstructor({ selector: 'badNode[label="Login"]' as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidAttribute }),
			);
		});
	});

	describe("Android", () => {
		beforeAll(() => {
			vi.stubGlobal("driver", {
				capabilities: {
					platformName: "Android",
				},
			});
		});

		it("throws InvalidSelectorError when selector is empty", () => {
			expect(() => new XPathConstructor({ selector: "" as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidSelector }),
			);
		});

		it("throws InvalidSelectorError when selector format is invalid", () => {
			expect(() => new XPathConstructor({ selector: "not-valid" as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidSelector }),
			);
		});

		it("throws SelectorRequiredError when selector for the current platform is not provided", () => {
			expect(() => new XPathConstructor({ selector: 'label="Login"' as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.SelectorRequired }),
			);
		});

		it("throws InvalidAttributeError for an invalid Android node", () => {
			expect(() => new XPathConstructor({ selector: 'badNode[text="Login"]' as Selector })).toThrowError(
				expect.objectContaining({ name: Exception.InvalidAttribute }),
			);
		});
	});
});
