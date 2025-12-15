import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Text,
  Card,
  Button,
  Badge,
  Icon,
} from "@shopify/polaris";
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

  const StatCard = ({ icon, title, value, change, iconBg = "#eef2ff", iconColor = "#2563eb" }: any) => (
    <div style={{
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      flex: 1,
      minWidth: "0"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ color: iconColor }}>
            <Icon source={icon} tone="base" />
          </div>
        </div>
        <Text as="h3" variant="headingSm" tone="subdued">
          {title}
        </Text>
        {change && (
          <Badge tone="success">{change}</Badge>
        )}
      </div>
      <Text as="h2" variant="heading2xl" fontWeight="bold">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
    </div>
  );

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <Text as="h1" variant="headingLg" fontWeight="bold">
              Dashboard
            </Text>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "8px" }}>
              <Text as="p" variant="bodySm" tone="subdued">
                {shop}
              </Text>
              <Badge tone="success">Active</Badge>
              <Badge>Pro Plan</Badge>
            </div>
          </div>
          <Button variant="primary">Create Delivery Rule</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          icon={ViewIcon}
          title="ETA Shown Today"
          value={stats.etaShownToday}
          change={stats.etaShownChange}
        />
        <StatCard
          icon={ProductIcon}
          title="Product Pages Using ETA"
          value={stats.productPagesUsingETA}
        />
        <StatCard
          icon={CartIcon}
          title="Cart Pages Using ETA"
          value={stats.cartPagesUsingETA}
          change={stats.cartPagesChange}
        />
        <StatCard
          icon={ChartVerticalIcon}
          title="Conversion Uplift"
          value={stats.conversionUplift}
          change={stats.conversionChange}
        />
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
        {/* Active Delivery Rules */}
        <Card>
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Active Delivery Rules
              </Text>
              <Button variant="plain">View all</Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {deliveryRules.map((rule, index) => (
                <div
                  key={rule.id}
                  style={{
                    paddingBottom: index < deliveryRules.length - 1 ? "16px" : "0",
                    borderBottom: index < deliveryRules.length - 1 ? "1px solid #e5e7eb" : "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <Text as="h3" variant="headingSm" fontWeight="semibold">
                          {rule.name}
                        </Text>
                        {rule.isActive ? (
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#10b981"/>
                            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                          </svg>
                        ) : null}
                      </div>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {rule.carrier}
                      </Text>
                      <div style={{ display: "flex", gap: "24px", marginTop: "8px", fontSize: "13px", color: "#6b7280" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span>{rule.location}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          <span>{rule.deliveryTime}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 11l3 3L22 4"/>
                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                          </svg>
                          <span>Cutoff: {rule.cutoffTime}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                        <input
                          type="checkbox"
                          checked={rule.isActive}
                          readOnly
                          style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span style={{
                          position: "absolute",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: rule.isActive ? "#2563eb" : "#cbd5e1",
                          borderRadius: "24px",
                          transition: "0.3s"
                        }}>
                          <span style={{
                            position: "absolute",
                            content: "",
                            height: "18px",
                            width: "18px",
                            left: rule.isActive ? "23px" : "3px",
                            bottom: "3px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "0.3s"
                          }} />
                        </span>
                      </label>
                      <Button variant="plain" size="slim">Edit</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Shipping Methods */}
        <Card>
          <div style={{ padding: "20px" }}>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Shipping Methods Detected
            </Text>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {shippingMethods.map((method) => {
                const iconColors: Record<string, string> = {
                  DHL: "#FFCC00",
                  DPD: "#DC0032",
                  UPS: "#FFB500",
                  Custom: "#6b7280"
                };

                const iconBgColors: Record<string, string> = {
                  DHL: "#FFF9E6",
                  DPD: "#FFE6EC",
                  UPS: "#FFF5E6",
                  Custom: "#f3f4f6"
                };

                return (
                  <div key={method.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: iconBgColors[method.name] || "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        fontSize: "14px",
                        color: iconColors[method.name] || "#6b7280"
                      }}>
                        {method.name === "DHL" ? "📦" :
                         method.name === "DPD" ? "🚚" :
                         method.name === "UPS" ? "📮" : "✈️"}
                      </div>
                      <Text as="p" variant="bodyMd">
                        {method.name}
                      </Text>
                    </div>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {method.rulesCount} {method.rulesCount === 1 ? "rule" : "rules"}
                    </Text>
                  </div>
                );
              })}
              <Button fullWidth variant="plain">+ Add Custom Carrier</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Text as="p" variant="bodySm" tone="subdued">
          Setup takes less than 5 minutes • No coding required
        </Text>
      </div>
    </div>
  );
}
