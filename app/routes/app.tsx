import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError, useLocation } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { Text } from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getTranslation, type TranslationKey } from "../i18n/translations";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get store to fetch current plan and settings
  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  const settings = await db.settings.findUnique({
    where: { storeId: store?.id },
  });

  const currentPlan = store?.plan || "free";
  const currentLanguage = settings?.defaultLanguage || "en";

  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    currentPlan,
    currentLanguage,
  });
};

export default function App() {
  const { apiKey, currentPlan, currentLanguage } = useLoaderData<typeof loader>();
  const location = useLocation();

  // Translation helper
  const t = (key: TranslationKey) => getTranslation(currentLanguage, key);

  const menuItems = [
    { path: "/app", label: t("dashboard"), icon: "grid" },
    { path: "/app/delivery-rules", label: t("deliveryRules"), icon: "package" },
    { path: "/app/holidays", label: t("holidays"), icon: "calendar" },
    { path: "/app/multi-country", label: t("multiCountry"), icon: "globe" },
    { path: "/app/product-targeting", label: t("productTargeting"), icon: "target" },
    { path: "/app/cart-checkout", label: t("cartCheckout"), icon: "cart" },
    { path: "/app/message-templates", label: t("messageTemplates"), icon: "message" },
    { path: "/app/analytics", label: t("analytics"), icon: "chart" },
    { path: "/app/plans-billing", label: t("plansBilling"), icon: "card" },
    { path: "/app/settings", label: t("settings"), icon: "settings" },
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
    <AppProvider isEmbeddedApp={true} apiKey={apiKey}>
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
          {/* Logo */}
          <div style={{ padding: "20px 16px" }}>
            <img
              src="/images/etaly-logo.svg"
              alt="ETAly"
              style={{
                width: "140px",
                height: "auto"
              }}
            />
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

          {/* Current Plan Badge at Bottom */}
          <div style={{ padding: "16px", marginTop: "auto" }}>
            <Link to="/app/plans-billing" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: currentPlan === "free" ? "#f3f4f6" : currentPlan === "pro" ? "#dbeafe" : "#fef3c7",
                  padding: "12px",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
                  {currentPlan === "free" ? (
                    <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : currentPlan === "pro" ? (
                    <svg width="16" height="16" fill="#2563eb" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="#f59e0b" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )}
                  <Text
                    as="p"
                    variant="bodySm"
                    fontWeight="semibold"
                  >
                    <span style={{ color: currentPlan === "free" ? "#6b7280" : currentPlan === "pro" ? "#2563eb" : "#f59e0b" }}>
                      {currentPlan === "free" ? t("freePlan") : currentPlan === "pro" ? t("proPlan") : t("advancedPlan")}
                    </span>
                  </Text>
                </div>
                <Text as="p" variant="bodySm" tone="subdued">
                  {currentPlan === "free" ? t("oneRuleOneCountry") : currentPlan === "pro" ? t("unlimitedRulesCountries") : t("everythingMultiStore")}
                </Text>
                {currentPlan === "free" && (
                  <div style={{ marginTop: "8px" }}>
                    <div
                      style={{
                        background: "#2563eb",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {t("upgradeToPro")}
                    </div>
                  </div>
                )}
              </div>
            </Link>
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
