import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { Text, InlineStack } from "@shopify/polaris";

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
    { path: "/app", label: "Dashboard", icon: "grid" },
    { path: "/app/delivery-rules", label: "Delivery Rules", icon: "package" },
    { path: "/app/holidays", label: "Holidays & Weekends", icon: "calendar" },
    { path: "/app/multi-country", label: "Multi-Country Setup", icon: "globe" },
    { path: "/app/product-targeting", label: "Product Targeting", icon: "target" },
    { path: "/app/cart-checkout", label: "Cart & Checkout", icon: "cart" },
    { path: "/app/message-templates", label: "Message Templates", icon: "message" },
    { path: "/app/analytics", label: "Analytics", icon: "chart" },
    { path: "/app/plans", label: "Plans & Billing", icon: "card" },
    { path: "/app/settings", label: "Settings", icon: "settings" },
  ];

  const renderIcon = (iconName: string, isActive: boolean) => {
    const color = isActive ? "#2563eb" : "#6b7280";
    const iconStyle = { width: "20px", height: "20px", strokeWidth: "2" };

    const icons: Record<string, JSX.Element> = {
      grid: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      package: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      calendar: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      globe: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      target: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      cart: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      message: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      chart: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      card: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      settings: (
        <svg fill="none" stroke={color} viewBox="0 0 24 24" style={iconStyle}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M6 6l4.2 4.2M13.8 13.8L18 18M1 12h6m6 0h6M6 18l4.2-4.2M13.8 10.2L18 6" />
        </svg>
      ),
    };

    return icons[iconName] || icons.grid;
  };

  return (
    <AppProvider isEmbeddedApp={false} apiKey={apiKey}>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Custom Sidebar */}
        <div
          style={{
            width: "256px",
            background: "#ffffff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            padding: "0",
          }}
        >
          {/* Logo & App Name */}
          <div style={{ padding: "20px 16px" }}>
            <InlineStack gap="300" blockAlign="center">
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#2563eb",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
              </div>
              <div>
                <Text as="h1" variant="headingMd" fontWeight="bold">
                  Delivery ETA
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  v1.0
                </Text>
              </div>
            </InlineStack>
          </div>

          {/* Navigation Menu */}
          <nav style={{ flex: 1, padding: "0 12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      background: isActive ? "#eef2ff" : "transparent",
                      color: isActive ? "#2563eb" : "#374151",
                      transition: "all 0.15s",
                      fontSize: "14px",
                      fontWeight: isActive ? "500" : "400",
                    }}
                  >
                    {renderIcon(item.icon, isActive)}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Pro Plan Badge at Bottom */}
          <div style={{ padding: "16px", marginTop: "auto" }}>
            <div
              style={{
                background: "#d1fae5",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg width="16" height="16" fill="#10b981" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Pro Plan
                </Text>
              </div>
              <Text as="p" variant="bodySm" tone="subdued">
                Unlimited rules & countries
              </Text>
            </div>
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
