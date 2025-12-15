import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return {
    shop: session.shop,
  };
};

export default function ProductTargeting() {
  const { } = useLoaderData<typeof loader>();

  const tags = [
    { id: "1", name: "Premium", isActive: true },
    { id: "2", name: "Fast Shipping", isActive: false },
    { id: "3", name: "Pre-order", isActive: false },
    { id: "4", name: "Limited Edition", isActive: false },
    { id: "5", name: "Sale", isActive: false },
  ];

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Product & Collection Targeting
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Choose which products should display delivery ETA messages
        </Text>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
        {/* Left Column - Main Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Application Scope */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Application Scope
            </Text>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* All Products Option */}
              <div
                style={{
                  padding: "20px",
                  border: "2px solid #2563eb",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    defaultChecked
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      <span style={{ color: "#2563eb" }}>All Products</span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Show delivery ETA on all product pages in your store
                    </Text>
                  </div>
                </div>
              </div>

              {/* Specific Products Option */}
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg width="20" height="20" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <circle cx="9" cy="9" r="7" />
                    <path d="M14 14l7 7" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      Specific Products
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Manually select individual products
                    </Text>
                  </div>
                </div>
              </div>

              {/* Collections Option */}
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg width="20" height="20" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      Collections
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Target entire collections of products
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tag-Based Targeting */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Tag-Based Targeting (Advanced)
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ marginTop: "8px", display: "block" }}>
                Show ETA only on products with specific tags
              </span>
            </Text>

            <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    background: tag.isActive ? "#2563eb" : "white",
                    color: tag.isActive ? "white" : "#6b7280",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                  }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                  {tag.name}
                  {tag.isActive && (
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Exclude Products */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Exclude Products
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ marginTop: "8px", display: "block" }}>
                Prevent ETA from showing on specific products (e.g., pre-orders, digital products)
              </span>
            </Text>

            <button
              style={{
                width: "100%",
                marginTop: "16px",
                padding: "16px",
                background: "transparent",
                border: "2px dashed #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#6b7280",
                fontSize: "14px",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              + Add Excluded Products
            </button>
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Summary */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Summary
            </Text>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Target Mode
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  All
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Tags Filter
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  1
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Excluded
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  0
                </Text>
              </div>
            </div>
          </div>

          {/* Variant-Level Override */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  <span style={{ color: "#2563eb" }}>Variant-Level Override</span>
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  <span style={{ marginTop: "4px", display: "block" }}>
                    Need different ETAs for product variants? Upgrade to Pro to set delivery times per variant.
                  </span>
                </Text>
              </div>
            </div>
            <a
              href="#"
              style={{
                marginTop: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "#2563eb",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Learn about variant-level ETA
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Quick Actions
            </Text>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#374151",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: "500",
                }}
              >
                Select all products
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#374151",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: "500",
                }}
              >
                Clear selection
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#374151",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: "500",
                }}
              >
                Import from CSV
              </button>
            </div>
          </div>

          {/* Save Button */}
          <Button variant="primary" size="large" fullWidth>
            Save Targeting Rules
          </Button>
        </div>
      </div>
    </div>
  );
}
