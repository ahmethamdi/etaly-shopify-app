import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Text, Button, Modal, TextField } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get store
  const store = await db.store.findUnique({
    where: { shop: session.shop },
    include: { settings: true },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  // Create settings if not exists
  let settings = store.settings;
  if (!settings) {
    settings = await db.settings.create({
      data: {
        storeId: store.id,
      },
    });
  }

  return json({
    shop: session.shop,
    targetingMode: settings.targetingMode || "all",
    targetTags: settings.targetTags ? JSON.parse(settings.targetTags) : [],
    excludedProducts: settings.excludedProducts ? JSON.parse(settings.excludedProducts) : [],
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  const store = await db.store.findUnique({
    where: { shop: session.shop },
    include: { settings: true },
  });

  if (!store || !store.settings) {
    return json({ error: "Store or settings not found" }, { status: 404 });
  }

  try {
    if (action === "saveTargeting") {
      const targetingMode = formData.get("targetingMode") as string;
      const targetTags = formData.get("targetTags") as string;
      const excludedProducts = formData.get("excludedProducts") as string;

      await db.settings.update({
        where: { id: store.settings.id },
        data: {
          targetingMode,
          targetTags,
          excludedProducts,
        },
      });

      return json({ success: true });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Failed to perform action" }, { status: 500 });
  }
};

export default function ProductTargeting() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // State
  const [targetingMode, setTargetingMode] = useState(loaderData.targetingMode);
  const [activeTags, setActiveTags] = useState<string[]>(loaderData.targetTags);
  const [excludedProducts, setExcludedProducts] = useState<string[]>(loaderData.excludedProducts);
  const [showExcludeModal, setShowExcludeModal] = useState(false);
  const [productIdInput, setProductIdInput] = useState("");

  // Available tags
  const availableTags = [
    "Premium",
    "Fast Shipping",
    "Pre-order",
    "Limited Edition",
    "Sale",
    "New Arrival",
    "Best Seller",
    "Clearance",
  ];

  // Toggle tag
  const toggleTag = (tagName: string) => {
    if (activeTags.includes(tagName)) {
      setActiveTags(activeTags.filter((t) => t !== tagName));
    } else {
      setActiveTags([...activeTags, tagName]);
    }
  };

  // Add excluded product
  const addExcludedProduct = () => {
    if (productIdInput && !excludedProducts.includes(productIdInput)) {
      setExcludedProducts([...excludedProducts, productIdInput]);
      setProductIdInput("");
      setShowExcludeModal(false);
    }
  };

  // Remove excluded product
  const removeExcludedProduct = (productId: string) => {
    setExcludedProducts(excludedProducts.filter((id) => id !== productId));
  };

  // Quick actions
  const selectAllProducts = () => {
    setTargetingMode("all");
    setActiveTags([]);
  };

  const clearSelection = () => {
    setActiveTags([]);
    setExcludedProducts([]);
  };

  // Save settings
  const handleSave = () => {
    const formData = new FormData();
    formData.append("action", "saveTargeting");
    formData.append("targetingMode", targetingMode);
    formData.append("targetTags", JSON.stringify(activeTags));
    formData.append("excludedProducts", JSON.stringify(excludedProducts));
    fetcher.submit(formData, { method: "post" });
  };

  // Get display mode text
  const getModeText = () => {
    switch (targetingMode) {
      case "all":
        return "All Products";
      case "specific":
        return "Specific Products";
      case "collections":
        return "Collections";
      default:
        return "All Products";
    }
  };

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
                onClick={() => setTargetingMode("all")}
                style={{
                  padding: "20px",
                  border: targetingMode === "all" ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: targetingMode === "all" ? "#eff6ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    checked={targetingMode === "all"}
                    onChange={() => setTargetingMode("all")}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke={targetingMode === "all" ? "#2563eb" : "#6b7280"}
                    viewBox="0 0 24 24"
                    style={{ strokeWidth: "2" }}
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      <span style={{ color: targetingMode === "all" ? "#2563eb" : "#374151" }}>All Products</span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Show delivery ETA on all product pages in your store
                    </Text>
                  </div>
                </div>
              </div>

              {/* Specific Products Option */}
              <div
                onClick={() => setTargetingMode("specific")}
                style={{
                  padding: "20px",
                  border: targetingMode === "specific" ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: targetingMode === "specific" ? "#eff6ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    checked={targetingMode === "specific"}
                    onChange={() => setTargetingMode("specific")}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke={targetingMode === "specific" ? "#2563eb" : "#6b7280"}
                    viewBox="0 0 24 24"
                    style={{ strokeWidth: "2" }}
                  >
                    <circle cx="9" cy="9" r="7" />
                    <path d="M14 14l7 7" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      <span style={{ color: targetingMode === "specific" ? "#2563eb" : "#374151" }}>
                        Specific Products
                      </span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Manually select individual products
                    </Text>
                  </div>
                </div>
              </div>

              {/* Collections Option */}
              <div
                onClick={() => setTargetingMode("collections")}
                style={{
                  padding: "20px",
                  border: targetingMode === "collections" ? "2px solid #2563eb" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: targetingMode === "collections" ? "#eff6ff" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="scope"
                    checked={targetingMode === "collections"}
                    onChange={() => setTargetingMode("collections")}
                    style={{
                      width: "20px",
                      height: "20px",
                      cursor: "pointer",
                      accentColor: "#2563eb",
                    }}
                  />
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke={targetingMode === "collections" ? "#2563eb" : "#6b7280"}
                    viewBox="0 0 24 24"
                    style={{ strokeWidth: "2" }}
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      <span style={{ color: targetingMode === "collections" ? "#2563eb" : "#374151" }}>
                        Collections
                      </span>
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
              {availableTags.map((tagName) => {
                const isActive = activeTags.includes(tagName);
                return (
                  <button
                    key={tagName}
                    onClick={() => toggleTag(tagName)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: isActive ? "#2563eb" : "white",
                      color: isActive ? "white" : "#6b7280",
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
                    {tagName}
                    {isActive && (
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    )}
                  </button>
                );
              })}
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

            {/* Excluded products list */}
            {excludedProducts.length > 0 && (
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {excludedProducts.map((productId) => (
                  <div
                    key={productId}
                    style={{
                      padding: "12px 16px",
                      background: "#f9fafb",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text as="p" variant="bodySm">
                      Product ID: {productId}
                    </Text>
                    <button
                      onClick={() => removeExcludedProduct(productId)}
                      style={{
                        padding: "4px 8px",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#dc2626",
                      }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowExcludeModal(true)}
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
                  {getModeText()}
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Tags Filter
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {activeTags.length}
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Excluded
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {excludedProducts.length}
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
              href="/app/plans"
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
                onClick={selectAllProducts}
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
                onClick={clearSelection}
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
                disabled
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "not-allowed",
                  color: "#9ca3af",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontWeight: "500",
                }}
              >
                Import from CSV (Coming soon)
              </button>
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleSave}
            loading={fetcher.state === "submitting"}
          >
            Save Targeting Rules
          </Button>
        </div>
      </div>

      {/* Exclude Product Modal */}
      <Modal
        open={showExcludeModal}
        onClose={() => {
          setShowExcludeModal(false);
          setProductIdInput("");
        }}
        title="Add Excluded Product"
        primaryAction={{
          content: "Add Product",
          onAction: addExcludedProduct,
          disabled: !productIdInput,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowExcludeModal(false);
              setProductIdInput("");
            },
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Product ID"
            value={productIdInput}
            onChange={setProductIdInput}
            autoComplete="off"
            placeholder="Enter Shopify Product ID"
            helpText="You can find the product ID in your Shopify admin URL when editing a product"
          />
        </Modal.Section>
      </Modal>
    </div>
  );
}
