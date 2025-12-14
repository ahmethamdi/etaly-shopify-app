import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { Box, Text, BlockStack, InlineStack } from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const location = useLocation();

  const menuItems = [
    { path: "/app", label: "Dashboard", icon: "📊" },
    { path: "/app/delivery-rules", label: "Delivery Rules", icon: "📦" },
    { path: "/app/holidays", label: "Holidays & Weekends", icon: "📅" },
    { path: "/app/multi-country", label: "Multi-Country Setup", icon: "🌍" },
    { path: "/app/product-targeting", label: "Product Targeting", icon: "🎯" },
    { path: "/app/cart-checkout", label: "Cart & Checkout", icon: "🛒" },
    { path: "/app/message-templates", label: "Message Templates", icon: "💬" },
    { path: "/app/analytics", label: "Analytics", icon: "📈" },
    { path: "/app/plans", label: "Plans & Billing", icon: "💳" },
    { path: "/app/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <AppProvider isEmbeddedApp={false} apiKey={apiKey}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Custom Sidebar */}
        <div
          style={{
            width: "240px",
            background: "#f9fafb",
            borderRight: "1px solid #e1e3e5",
            display: "flex",
            flexDirection: "column",
            padding: "16px 0",
          }}
        >
          {/* Logo & App Name */}
          <div style={{ padding: "0 16px 24px" }}>
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="center">
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "#008060",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  E
                </div>
                <Text as="h1" variant="headingMd" fontWeight="semibold">
                  Delivery ETA
                </Text>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                v1.0
              </Text>
            </BlockStack>
          </div>

          {/* Navigation Menu */}
          <nav style={{ flex: 1, padding: "0 8px" }}>
            <BlockStack gap="100">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: isActive ? "#008060" : "transparent",
                      color: isActive ? "white" : "#202223",
                      transition: "all 0.2s",
                    }}
                  >
                    <InlineStack gap="200" blockAlign="center">
                      <span style={{ fontSize: "16px" }}>{item.icon}</span>
                      <Text
                        as="span"
                        variant="bodySm"
                        fontWeight={isActive ? "semibold" : "regular"}
                      >
                        {item.label}
                      </Text>
                    </InlineStack>
                  </Link>
                );
              })}
            </BlockStack>
          </nav>

          {/* Pro Plan Badge at Bottom */}
          <div style={{ padding: "16px" }}>
            <Box
              background="bg-surface-success"
              padding="300"
              borderRadius="200"
            >
              <Text as="p" variant="bodySm" fontWeight="semibold" alignment="center">
                Pro Plan
              </Text>
            </Box>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflow: "auto", background: "white" }}>
          <Outlet />
        </div>
      </div>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
