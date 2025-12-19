import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Text, Button, Modal, TextField, Spinner, Thumbnail, Checkbox } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session, admin } = await authenticate.admin(request);

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

    let products = [];
    let collections = [];

    // Try to fetch products from Shopify using GraphQL
    try {
      const productsQuery = `
        query {
          products(first: 50) {
            edges {
              node {
                id
                title
                featuredImage {
                  url
                  altText
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                totalInventory
                status
                tags
              }
            }
          }
        }
      `;

      const productsResponse = await admin.graphql(productsQuery);
      const productsData = await productsResponse.json();

      if (productsData?.data?.products?.edges) {
        products = productsData.data.products.edges.map((edge: any) => ({
          id: edge.node.id.replace('gid://shopify/Product/', ''),
          title: edge.node.title,
          image: edge.node.featuredImage?.url || null,
          price: edge.node.priceRangeV2.minVariantPrice.amount,
          currency: edge.node.priceRangeV2.minVariantPrice.currencyCode,
          inventory: edge.node.totalInventory || 0,
          status: edge.node.status,
          tags: edge.node.tags || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    // Try to fetch collections from Shopify
    try {
      const collectionsQuery = `
        query {
          collections(first: 50) {
            edges {
              node {
                id
                title
                productsCount
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      `;

      const collectionsResponse = await admin.graphql(collectionsQuery);
      const collectionsData = await collectionsResponse.json();

      if (collectionsData?.data?.collections?.edges) {
        collections = collectionsData.data.collections.edges.map((edge: any) => ({
          id: edge.node.id.replace('gid://shopify/Collection/', ''),
          title: edge.node.title,
          productsCount: edge.node.productsCount,
          image: edge.node.image?.url || null,
        }));
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }

    return json({
      shop: session.shop,
      targetingMode: settings.targetingMode || "all",
      targetTags: settings.targetTags ? JSON.parse(settings.targetTags) : [],
      excludedProducts: settings.excludedProducts ? JSON.parse(settings.excludedProducts) : [],
      products,
      collections,
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      shop: "unknown",
      targetingMode: "all",
      targetTags: [],
      excludedProducts: [],
      products: [],
      collections: [],
    });
  }
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
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

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

  // Filter products based on search
  const filteredProducts = loaderData.products.filter((product: any) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter collections based on search
  const filteredCollections = loaderData.collections.filter((collection: any) =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle tag
  const toggleTag = (tagName: string) => {
    if (activeTags.includes(tagName)) {
      setActiveTags(activeTags.filter((t) => t !== tagName));
    } else {
      setActiveTags([...activeTags, tagName]);
    }
  };

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Toggle collection selection
  const toggleCollection = (collectionId: string) => {
    if (selectedCollections.includes(collectionId)) {
      setSelectedCollections(selectedCollections.filter((id) => id !== collectionId));
    } else {
      setSelectedCollections([...selectedCollections, collectionId]);
    }
  };

  // Add excluded product
  const addExcludedProducts = () => {
    const newExcluded = [...excludedProducts];
    selectedProducts.forEach((productId) => {
      if (!newExcluded.includes(productId)) {
        newExcluded.push(productId);
      }
    });
    setExcludedProducts(newExcluded);
    setSelectedProducts([]);
    setShowProductModal(false);
  };

  // Remove excluded product
  const removeExcludedProduct = (productId: string) => {
    setExcludedProducts(excludedProducts.filter((id) => id !== productId));
  };

  // Quick actions
  const selectAllProducts = () => {
    setTargetingMode("all");
    setActiveTags([]);
    setSelectedProducts([]);
    setExcludedProducts([]);
  };

  const clearSelection = () => {
    setActiveTags([]);
    setExcludedProducts([]);
    setSelectedProducts([]);
    setSelectedCollections([]);
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

  // Get product by ID
  const getProductById = (productId: string) => {
    return loaderData.products.find((p: any) => p.id === productId);
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
                      Show delivery ETA on all {loaderData.products.length} products in your store
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
                  <div style={{ flex: 1 }}>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      <span style={{ color: targetingMode === "specific" ? "#2563eb" : "#374151" }}>
                        Specific Products
                      </span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Manually select individual products from your catalog
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
                      Target entire collections ({loaderData.collections.length} available)
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
                {excludedProducts.map((productId) => {
                  const product = getProductById(productId);
                  return (
                    <div
                      key={productId}
                      style={{
                        padding: "12px",
                        background: "#f9fafb",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "4px",
                              background: "#e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg width="20" height="20" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <Text as="p" variant="bodySm" fontWeight="medium">
                            {product?.title || `Product #${productId}`}
                          </Text>
                          {product && (
                            <Text as="p" variant="bodySm" tone="subdued">
                              {product.currency} {parseFloat(product.price).toFixed(2)}
                            </Text>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeExcludedProduct(productId)}
                        style={{
                          padding: "8px",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setShowProductModal(true)}
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
                fontWeight: "500",
              }}
            >
              + Browse & Exclude Products
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
                  Total Products
                </Text>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  {loaderData.products.length}
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

      {/* Browse Products Modal */}
      <Modal
        open={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProducts([]);
          setSearchQuery("");
        }}
        title={`Browse Products (${loaderData.products.length})`}
        primaryAction={{
          content: `Exclude ${selectedProducts.length} Product${selectedProducts.length !== 1 ? 's' : ''}`,
          onAction: addExcludedProducts,
          disabled: selectedProducts.length === 0,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowProductModal(false);
              setSelectedProducts([]);
              setSearchQuery("");
            },
          },
        ]}
      >
        <Modal.Section>
          <div style={{ marginBottom: "16px" }}>
            <TextField
              label=""
              value={searchQuery}
              onChange={setSearchQuery}
              autoComplete="off"
              placeholder="Search products..."
              prefix={
                <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              }
            />
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  No products found
                </Text>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredProducts.map((product: any) => (
                  <div
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    style={{
                      padding: "12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: selectedProducts.includes(product.id) ? "#eff6ff" : "white",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                          accentColor: "#2563eb",
                        }}
                      />
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "6px",
                            background: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="24" height="24" fill="none" stroke="#9ca3af" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <Text as="p" variant="bodyMd" fontWeight="medium">
                          {product.title}
                        </Text>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "4px" }}>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {product.currency} {parseFloat(product.price).toFixed(2)}
                          </Text>
                          <span style={{ color: "#d1d5db" }}>•</span>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Stock: {product.inventory}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}
