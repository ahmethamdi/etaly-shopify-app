import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Icon,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {
  ViewIcon,
  ProductIcon,
  CartIcon,
  ChartVerticalIcon,
} from "@shopify/polaris-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Mock data for now - we'll replace with real data later
  const stats = {
    etaShownToday: 2847,
    etaShownChange: "+12%",
    productPagesUsingETA: 124,
    productPagesChange: null,
    cartPagesUsingETA: 387,
    cartPagesChange: "+8%",
    conversionUplift: "+2.3%",
    conversionChange: "vs last week",
  };

  const deliveryRules = [
    {
      id: "1",
      name: "Standard Shipping – Germany",
      carrier: "DHL Standard",
      location: "Germany",
      deliveryTime: "2-3 business days",
      cutoffTime: "14:00 CET",
      isActive: true,
    },
    {
      id: "2",
      name: "Express Shipping – EU",
      carrier: "DPD Express",
      location: "European Union",
      deliveryTime: "1-2 business days",
      cutoffTime: "16:00 CET",
      isActive: true,
    },
    {
      id: "3",
      name: "Economy Shipping – Worldwide",
      carrier: "Standard Post",
      location: "International",
      deliveryTime: "5-10 business days",
      cutoffTime: "12:00 CET",
      isActive: false,
    },
  ];

  const shippingMethods = [
    { name: "DHL", rulesCount: 2 },
    { name: "DPD", rulesCount: 1 },
    { name: "UPS", rulesCount: 0 },
    { name: "Custom", rulesCount: 1 },
  ];

  return {
    shop: session.shop,
    stats,
    deliveryRules,
    shippingMethods,
  };
};

export default function Dashboard() {
  const { shop, stats, deliveryRules, shippingMethods } = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Dashboard">
        <button variant="primary">Create Delivery Rule</button>
      </TitleBar>
      <BlockStack gap="500">
        {/* Store Info Badge */}
        <InlineStack align="space-between">
          <InlineStack gap="200" blockAlign="center">
            <Text as="p" variant="bodyMd" tone="subdued">
              {shop}
            </Text>
            <Badge tone="success">Active</Badge>
            <Badge>Pro Plan</Badge>
          </InlineStack>
        </InlineStack>

        {/* Stats Cards */}
        <InlineStack gap="400" wrap={false}>
          <Box width="25%">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={ViewIcon} tone="base" />
                  <Text as="p" variant="bodySm" tone="subdued">
                    ETA Shown Today
                  </Text>
                </InlineStack>
                <InlineStack align="space-between" blockAlign="end">
                  <Text as="h2" variant="heading2xl">
                    {stats.etaShownToday.toLocaleString()}
                  </Text>
                  <Badge tone="success">{stats.etaShownChange}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Box>

          <Box width="25%">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={ProductIcon} tone="base" />
                  <Text as="p" variant="bodySm" tone="subdued">
                    Product Pages Using ETA
                  </Text>
                </InlineStack>
                <Text as="h2" variant="heading2xl">
                  {stats.productPagesUsingETA}
                </Text>
              </BlockStack>
            </Card>
          </Box>

          <Box width="25%">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={CartIcon} tone="base" />
                  <Text as="p" variant="bodySm" tone="subdued">
                    Cart Pages Using ETA
                  </Text>
                </InlineStack>
                <InlineStack align="space-between" blockAlign="end">
                  <Text as="h2" variant="heading2xl">
                    {stats.cartPagesUsingETA}
                  </Text>
                  <Badge tone="success">{stats.cartPagesChange}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Box>

          <Box width="25%">
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="200" blockAlign="center">
                  <Icon source={ChartVerticalIcon} tone="base" />
                  <Text as="p" variant="bodySm" tone="subdued">
                    Conversion Uplift
                  </Text>
                </InlineStack>
                <InlineStack align="space-between" blockAlign="end">
                  <Text as="h2" variant="heading2xl" tone="success">
                    {stats.conversionUplift}
                  </Text>
                  <Badge>{stats.conversionChange}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Box>
        </InlineStack>

        {/* Main Content */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Active Delivery Rules
                  </Text>
                  <Button variant="plain">View all</Button>
                </InlineStack>

                {deliveryRules.map((rule) => (
                  <Box
                    key={rule.id}
                    padding="400"
                    borderColor="border"
                    borderWidth="025"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack align="space-between" blockAlign="start">
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="h3" variant="headingSm" fontWeight="semibold">
                              {rule.name}
                            </Text>
                            <Badge tone={rule.isActive ? "success" : "info"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {rule.carrier}
                          </Text>
                        </BlockStack>
                        <Button variant="plain" size="slim">
                          Edit
                        </Button>
                      </InlineStack>
                      <InlineStack gap="400">
                        <InlineStack gap="100">
                          <Text as="span" variant="bodySm" tone="subdued">
                            📍
                          </Text>
                          <Text as="span" variant="bodySm">
                            {rule.location}
                          </Text>
                        </InlineStack>
                        <InlineStack gap="100">
                          <Text as="span" variant="bodySm" tone="subdued">
                            ⏱️
                          </Text>
                          <Text as="span" variant="bodySm">
                            {rule.deliveryTime}
                          </Text>
                        </InlineStack>
                        <InlineStack gap="100">
                          <Text as="span" variant="bodySm" tone="subdued">
                            ✂️
                          </Text>
                          <Text as="span" variant="bodySm">
                            Cutoff: {rule.cutoffTime}
                          </Text>
                        </InlineStack>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Shipping Methods Detected
                </Text>
                {shippingMethods.map((method) => (
                  <InlineStack key={method.name} align="space-between">
                    <InlineStack gap="200" blockAlign="center">
                      <Box
                        background="bg-surface-secondary"
                        padding="200"
                        borderRadius="100"
                      >
                        <Text as="span" variant="bodySm" fontWeight="semibold">
                          {method.name.substring(0, 2).toUpperCase()}
                        </Text>
                      </Box>
                      <Text as="p" variant="bodyMd">
                        {method.name}
                      </Text>
                    </InlineStack>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {method.rulesCount} {method.rulesCount === 1 ? "rule" : "rules"}
                    </Text>
                  </InlineStack>
                ))}
                <Button fullWidth variant="plain">
                  + Add Custom Carrier
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Footer Note */}
        <Box paddingBlockStart="400">
          <Text as="p" variant="bodySm" tone="subdued" alignment="center">
            Setup takes less than 5 minutes • No coding required
          </Text>
        </Box>
      </BlockStack>
    </Page>
  );
}
