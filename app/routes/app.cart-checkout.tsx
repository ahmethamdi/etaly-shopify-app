import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return {
    shop: session.shop,
  };
};

export default function CartCheckout() {
  const {} = useLoaderData<typeof loader>();

  const [cartMessageStyle, setCartMessageStyle] = useState<"info" | "success" | "warning">("info");
  const [checkoutMessageStyle, setCheckoutMessageStyle] = useState<"info" | "success" | "warning">("success");

  const messageStyles = {
    info: {
      background: "#eff6ff",
      color: "#2563eb",
      border: "#2563eb",
    },
    success: {
      background: "#d1fae5",
      color: "#10b981",
      border: "#10b981",
    },
    warning: {
      background: "#fef3c7",
      color: "#f59e0b",
      border: "#f59e0b",
    },
  };

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Cart & Checkout ETA Settings
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Reinforce customer trust at critical decision points
        </Text>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Cart Page */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Cart Page
              </Text>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
              <input
                type="checkbox"
                defaultChecked
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#2563eb",
                  borderRadius: "24px",
                  transition: "0.3s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: "23px",
                    bottom: "3px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.3s",
                  }}
                />
              </span>
            </label>
          </div>

          {/* Position */}
          <div style={{ marginBottom: "20px" }}>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>Position</span>
            </Text>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>Under product title</option>
              <option>Above product title</option>
              <option>Below price</option>
            </select>
          </div>

          {/* Message Style */}
          <div style={{ marginBottom: "20px" }}>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "12px" }}>Message Style</span>
            </Text>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setCartMessageStyle("info")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: cartMessageStyle === "info" ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: cartMessageStyle === "info" ? "#eff6ff" : "white",
                  color: cartMessageStyle === "info" ? "#2563eb" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: cartMessageStyle === "info" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Info
              </button>
              <button
                onClick={() => setCartMessageStyle("success")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: cartMessageStyle === "success" ? "2px solid #10b981" : "1px solid #d1d5db",
                  background: cartMessageStyle === "success" ? "#d1fae5" : "white",
                  color: cartMessageStyle === "success" ? "#10b981" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: cartMessageStyle === "success" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Success
              </button>
              <button
                onClick={() => setCartMessageStyle("warning")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: cartMessageStyle === "warning" ? "2px solid #f59e0b" : "1px solid #d1d5db",
                  background: cartMessageStyle === "warning" ? "#fef3c7" : "white",
                  color: cartMessageStyle === "warning" ? "#f59e0b" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: cartMessageStyle === "warning" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Warning
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "12px" }}>Preview</span>
            </Text>
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", gap: "16px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    background: "#d1d5db",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Premium Leather Bag
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    €149.99
                  </Text>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: messageStyles[cartMessageStyle].background,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke={messageStyles[cartMessageStyle].color}
                      viewBox="0 0 24 24"
                      style={{ strokeWidth: "2" }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <Text as="span" variant="bodySm" fontWeight="medium">
                      <span style={{ color: messageStyles[cartMessageStyle].color }}>
                        Arrives by Thursday, 14 March
                      </span>
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#eff6ff",
              borderRadius: "8px",
              display: "flex",
              gap: "12px",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <Text as="p" variant="bodySm" fontWeight="semibold">
                <span style={{ color: "#2563eb" }}>Multiple Products</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <span style={{ marginTop: "4px", display: "block" }}>
                  When cart contains multiple products with different ETAs, the latest delivery date is shown.
                </span>
              </Text>
            </div>
          </div>
        </div>

        {/* Checkout Page */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: "#d1fae5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Checkout Page
              </Text>
            </div>
            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
              <input
                type="checkbox"
                defaultChecked
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "#2563eb",
                  borderRadius: "24px",
                  transition: "0.3s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: "",
                    height: "18px",
                    width: "18px",
                    left: "23px",
                    bottom: "3px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.3s",
                  }}
                />
              </span>
            </label>
          </div>

          {/* Position */}
          <div style={{ marginBottom: "20px" }}>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>Position</span>
            </Text>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>Order summary section</option>
              <option>Above order summary</option>
              <option>Below order summary</option>
            </select>
          </div>

          {/* Message Style */}
          <div style={{ marginBottom: "20px" }}>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "12px" }}>Message Style</span>
            </Text>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setCheckoutMessageStyle("info")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: checkoutMessageStyle === "info" ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: checkoutMessageStyle === "info" ? "#eff6ff" : "white",
                  color: checkoutMessageStyle === "info" ? "#2563eb" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: checkoutMessageStyle === "info" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Info
              </button>
              <button
                onClick={() => setCheckoutMessageStyle("success")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: checkoutMessageStyle === "success" ? "2px solid #10b981" : "1px solid #d1d5db",
                  background: checkoutMessageStyle === "success" ? "#d1fae5" : "white",
                  color: checkoutMessageStyle === "success" ? "#10b981" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: checkoutMessageStyle === "success" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Success
              </button>
              <button
                onClick={() => setCheckoutMessageStyle("warning")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: checkoutMessageStyle === "warning" ? "2px solid #f59e0b" : "1px solid #d1d5db",
                  background: checkoutMessageStyle === "warning" ? "#fef3c7" : "white",
                  color: checkoutMessageStyle === "warning" ? "#f59e0b" : "#6b7280",
                  fontSize: "14px",
                  fontWeight: checkoutMessageStyle === "warning" ? "600" : "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Warning
              </button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "12px" }}>Preview</span>
            </Text>
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                <span style={{ display: "block", marginBottom: "12px" }}>Order Summary</span>
              </Text>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Text as="span" variant="bodySm" tone="subdued">
                  Subtotal
                </Text>
                <Text as="span" variant="bodySm">
                  €149.99
                </Text>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <Text as="span" variant="bodySm" tone="subdued">
                  Shipping
                </Text>
                <Text as="span" variant="bodySm">
                  €4.99
                </Text>
              </div>
              <div
                style={{
                  marginBottom: "12px",
                  padding: "12px",
                  borderRadius: "6px",
                  background: messageStyles[checkoutMessageStyle].background,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke={messageStyles[checkoutMessageStyle].color}
                  viewBox="0 0 24 24"
                  style={{ strokeWidth: "2" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <Text as="span" variant="bodySm" fontWeight="medium">
                  <span style={{ color: messageStyles[checkoutMessageStyle].color }}>
                    Expected delivery: Thursday, 14 March
                  </span>
                </Text>
              </div>
              <div
                style={{
                  paddingTop: "12px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  Total
                </Text>
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  €154.98
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Shopify Checkout Extensibility */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Shopify Checkout Extensibility
          </Text>
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              background: "#d1fae5",
              borderRadius: "8px",
              display: "flex",
              gap: "12px",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <div>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Checkout Extension Active
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <span style={{ marginTop: "4px", display: "block" }}>
                  ETA messages are displayed using Shopify's official Checkout Extensibility API
                </span>
              </Text>
            </div>
          </div>
          <div style={{ marginTop: "16px", padding: "12px", background: "#f9fafb", borderRadius: "6px" }}>
            <Text as="p" variant="bodySm" tone="subdued">
              <strong>Note:</strong> Checkout customizations require Shopify Plus or use of Checkout
              Extensibility. Changes may take up to 5 minutes to appear.
            </Text>
          </div>
        </div>

        {/* Thank You Page */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              padding: "20px",
              background: "#fef3c7",
              borderRadius: "8px",
              display: "flex",
              gap: "12px",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                <span style={{ color: "#f59e0b" }}>Thank You Page</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <span style={{ marginTop: "8px", display: "block" }}>
                  Show actual delivery date on the order confirmation page to reduce "where is my order?" support tickets.
                </span>
              </Text>
              <a
                href="#"
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#f59e0b",
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                Configure Thank You Page
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
        <Button>Cancel</Button>
        <Button variant="primary">Save Settings</Button>
      </div>
    </div>
  );
}
