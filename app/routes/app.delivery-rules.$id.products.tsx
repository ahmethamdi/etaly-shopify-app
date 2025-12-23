import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  InlineStack,
  TextField,
  Checkbox,
  Banner,
  ResourceList,
  ResourceItem,
  Thumbnail,
  EmptyState,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ImageIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const ruleId = params.id!;

  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    throw new Response("Store not found", { status: 404 });
  }

  const rule = await db.deliveryRule.findUnique({
    where: { id: ruleId, storeId: store.id },
  });

  if (!rule) {
    throw new Response("Delivery rule not found", { status: 404 });
  }

  // Get existing product targeting
  const productTargeting = await db.productTargeting.findMany({
    where: { ruleId, storeId: store.id },
  });

  // Get product details from Shopify
  const productDetails = [];
  for (const target of productTargeting) {
    try {
      const response = await admin.rest.resources.Product.find({
        session,
        id: target.productId,
      });
      productDetails.push({
        ...target,
        title: response.title,
        image: response.image?.src || null,
      });
    } catch (error) {
      console.error(`Failed to fetch product ${target.productId}:`, error);
    }
  }

  return json({
    rule,
    productTargeting: productDetails,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const ruleId = params.id!;

  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    return json({ error: "Store not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "add") {
    const productId = formData.get("productId") as string;
    const variantId = (formData.get("variantId") as string) || null;
    const overrideMinDays = formData.get("overrideMinDays")
      ? parseInt(formData.get("overrideMinDays") as string)
      : null;
    const overrideMaxDays = formData.get("overrideMaxDays")
      ? parseInt(formData.get("overrideMaxDays") as string)
      : null;
    const overrideProcessingDays = formData.get("overrideProcessingDays")
      ? parseInt(formData.get("overrideProcessingDays") as string)
      : null;

    await db.productTargeting.create({
      data: {
        storeId: store.id,
        ruleId,
        productId,
        variantId,
        overrideMinDays,
        overrideMaxDays,
        overrideProcessingDays,
      },
    });

    return json({ success: true });
  }

  if (action === "delete") {
    const id = formData.get("id") as string;
    await db.productTargeting.delete({
      where: { id },
    });
    return json({ success: true });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function ProductTargeting() {
  const { rule, productTargeting } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const shopify = useAppBridge();

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [minDays, setMinDays] = useState(rule.minDays.toString());
  const [maxDays, setMaxDays] = useState(rule.maxDays.toString());
  const [processingDays, setProcessingDays] = useState(
    rule.processingDays.toString()
  );

  const openProductPicker = useCallback(async () => {
    const products = await shopify.resourcePicker({
      type: "product",
      action: "select",
      multiple: false,
    });

    if (products && products.length > 0) {
      const product = products[0];
      setSelectedProduct({
        id: product.id.split("/").pop(),
        title: product.title,
        image: product.images?.[0]?.originalSrc || null,
      });
      setShowProductPicker(true);
    }
  }, [shopify]);

  const handleAddProduct = useCallback(() => {
    if (!selectedProduct) return;

    const formData = new FormData();
    formData.append("action", "add");
    formData.append("productId", selectedProduct.id);
    if (overrideEnabled) {
      formData.append("overrideMinDays", minDays);
      formData.append("overrideMaxDays", maxDays);
      formData.append("overrideProcessingDays", processingDays);
    }

    submit(formData, { method: "post" });
    setSelectedProduct(null);
    setShowProductPicker(false);
    setOverrideEnabled(false);
  }, [selectedProduct, overrideEnabled, minDays, maxDays, processingDays, submit]);

  const handleDeleteProduct = useCallback(
    (id: string) => {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("id", id);
      submit(formData, { method: "post" });
    },
    [submit]
  );

  return (
    <Page
      title="Product-Specific Delivery Days"
      subtitle={`Configure custom delivery times for specific products in "${rule.name}" rule`}
      backAction={{ onAction: () => navigate(`/app/delivery-rules/${rule.id}`) }}
      primaryAction={{
        content: "Add Product",
        onAction: openProductPicker,
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner>
            <Text as="p">
              Set custom delivery days for specific products. If a product is
              not listed here, it will use the default delivery days from the
              rule (Min: {rule.minDays} days, Max: {rule.maxDays} days).
            </Text>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            {productTargeting.length === 0 ? (
              <EmptyState
                heading="No products configured"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <Text as="p">
                  Add products to configure custom delivery days for specific
                  items.
                </Text>
              </EmptyState>
            ) : (
              <ResourceList
                resourceName={{ singular: "product", plural: "products" }}
                items={productTargeting}
                renderItem={(item: any) => {
                  const { id, title, image, overrideMinDays, overrideMaxDays, overrideProcessingDays } = item;

                  return (
                    <ResourceItem
                      id={id}
                      media={
                        <Thumbnail
                          source={image || ImageIcon}
                          alt={title}
                          size="small"
                        />
                      }
                      accessibilityLabel={`View details for ${title}`}
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="bold" as="h3">
                            {title}
                          </Text>
                          {overrideMinDays !== null || overrideMaxDays !== null ? (
                            <Text variant="bodySm" as="p" tone="subdued">
                              Custom delivery: {overrideMinDays || rule.minDays}-
                              {overrideMaxDays || rule.maxDays} days
                              {overrideProcessingDays !== null &&
                                ` (+ ${overrideProcessingDays} processing days)`}
                            </Text>
                          ) : (
                            <Text variant="bodySm" as="p" tone="subdued">
                              Using default: {rule.minDays}-{rule.maxDays} days
                            </Text>
                          )}
                        </BlockStack>
                        <Button
                          tone="critical"
                          onClick={() => handleDeleteProduct(id)}
                        >
                          Remove
                        </Button>
                      </InlineStack>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card>
        </Layout.Section>

        {showProductPicker && selectedProduct && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Configure Product Delivery
                </Text>

                <InlineStack gap="300" align="start">
                  {selectedProduct.image && (
                    <Thumbnail
                      source={selectedProduct.image}
                      alt={selectedProduct.title}
                      size="large"
                    />
                  )}
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h3">
                      {selectedProduct.title}
                    </Text>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Product ID: {selectedProduct.id}
                    </Text>
                  </BlockStack>
                </InlineStack>

                <Checkbox
                  label="Override delivery days for this product"
                  checked={overrideEnabled}
                  onChange={setOverrideEnabled}
                />

                {overrideEnabled && (
                  <BlockStack gap="300">
                    <InlineStack gap="300">
                      <TextField
                        label="Min Days"
                        type="number"
                        value={minDays}
                        onChange={setMinDays}
                        autoComplete="off"
                      />
                      <TextField
                        label="Max Days"
                        type="number"
                        value={maxDays}
                        onChange={setMaxDays}
                        autoComplete="off"
                      />
                    </InlineStack>
                    <TextField
                      label="Processing Days"
                      type="number"
                      value={processingDays}
                      onChange={setProcessingDays}
                      autoComplete="off"
                    />
                  </BlockStack>
                )}

                <InlineStack gap="200">
                  <Button onClick={handleAddProduct} variant="primary">
                    Add Product
                  </Button>
                  <Button onClick={() => setShowProductPicker(false)}>
                    Cancel
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
