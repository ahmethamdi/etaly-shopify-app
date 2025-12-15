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

export default function Analytics() {
  const {} = useLoaderData<typeof loader>();

  const stats = [
    {
      icon: "👁️",
      iconBg: "#dbeafe",
      value: "2,847",
      label: "Total Impressions",
      subtitle: "Last 7 days",
      change: "+18%",
      changeColor: "#10b981",
    },
    {
      icon: "👆",
      iconBg: "#d1fae5",
      value: "369",
      label: "Click Events",
      subtitle: "CTR: 13.0%",
      change: "+24%",
      changeColor: "#10b981",
    },
    {
      icon: "🛒",
      iconBg: "#fef3c7",
      value: "4.1%",
      label: "Conversion Rate",
      subtitle: "vs 3.8% before",
      change: "+2.3%",
      changeColor: "#10b981",
    },
    {
      icon: "📈",
      iconBg: "#e0e7ff",
      value: "12.4%",
      label: "Cart Abandonment",
      subtitle: "vs 13.5% before",
      change: "-8%",
      changeColor: "#dc2626",
    },
  ];

  const topRules = [
    {
      id: "1",
      name: "Standard Shipping – Germany",
      impressions: "1247",
      conversions: "89",
      rate: "7.1%",
    },
    {
      id: "2",
      name: "Express Shipping – EU",
      impressions: "856",
      conversions: "67",
      rate: "7.8%",
    },
    {
      id: "3",
      name: "Same Day – Berlin",
      impressions: "412",
      conversions: "45",
      rate: "10.9%",
    },
    {
      id: "4",
      name: "Economy – Worldwide",
      impressions: "234",
      conversions: "12",
      rate: "5.1%",
    },
  ];

  const countries = [
    { flag: "🇩🇪", name: "Germany", count: "1845", percentage: "65%" },
    { flag: "🇦🇹", name: "Austria", count: "512", percentage: "18%" },
    { flag: "🇨🇭", name: "Switzerland", count: "312", percentage: "11%" },
    { flag: "🇪🇺", name: "Other EU", count: "171", percentage: "6%" },
  ];

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Analytics & Performance
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Track how delivery ETAs impact your store's conversion rate
        </Text>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: stat.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: stat.changeColor === "#10b981" ? "#d1fae5" : "#fecaca",
                  color: stat.changeColor,
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {stat.change}
              </span>
            </div>
            <Text as="h2" variant="heading2xl" fontWeight="bold">
              <span style={{ display: "block", marginBottom: "4px" }}>{stat.value}</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "4px" }}>{stat.label}</span>
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {stat.subtitle}
            </Text>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* ETA Impressions & Clicks Chart */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              ETA Impressions & Clicks
            </Text>
            <select
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                background: "white",
              }}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          {/* Simple Line Chart Visualization */}
          <div style={{ height: "250px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 600 250" style={{ overflow: "visible" }}>
              {/* Y-axis labels */}
              <text x="20" y="30" fontSize="12" fill="#6b7280">600</text>
              <text x="20" y="90" fontSize="12" fill="#6b7280">450</text>
              <text x="20" y="150" fontSize="12" fill="#6b7280">300</text>
              <text x="20" y="210" fontSize="12" fill="#6b7280">150</text>

              {/* X-axis labels */}
              <text x="70" y="240" fontSize="12" fill="#6b7280">Mon</text>
              <text x="160" y="240" fontSize="12" fill="#6b7280">Tue</text>
              <text x="250" y="240" fontSize="12" fill="#6b7280">Wed</text>
              <text x="340" y="240" fontSize="12" fill="#6b7280">Thu</text>
              <text x="430" y="240" fontSize="12" fill="#6b7280">Fri</text>
              <text x="520" y="240" fontSize="12" fill="#6b7280">Sat</text>
              <text x="570" y="240" fontSize="12" fill="#6b7280">Sun</text>

              {/* Impressions line (blue) */}
              <polyline
                points="70,180 160,140 250,120 340,130 430,110 520,90 570,70"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />
              <circle cx="70" cy="180" r="4" fill="#2563eb" />
              <circle cx="160" cy="140" r="4" fill="#2563eb" />
              <circle cx="250" cy="120" r="4" fill="#2563eb" />
              <circle cx="340" cy="130" r="4" fill="#2563eb" />
              <circle cx="430" cy="110" r="4" fill="#2563eb" />
              <circle cx="520" cy="90" r="4" fill="#2563eb" />
              <circle cx="570" cy="70" r="4" fill="#2563eb" />

              {/* Clicks line (green) */}
              <polyline
                points="70,215 160,213 250,212 340,210 430,209 520,207 570,205"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
              <circle cx="70" cy="215" r="4" fill="#10b981" />
              <circle cx="570" cy="205" r="4" fill="#10b981" />
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#2563eb" }} />
              <Text as="span" variant="bodySm">Impressions</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#10b981" }} />
              <Text as="span" variant="bodySm">Clicks</Text>
            </div>
          </div>
        </div>

        {/* Conversion Impact Chart */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Conversion Impact
            </Text>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "6px",
                background: "#d1fae5",
                color: "#10b981",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              +0.8% avg
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ height: "250px", position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 600 250">
              {/* Y-axis labels */}
              <text x="20" y="30" fontSize="12" fill="#6b7280">8</text>
              <text x="20" y="90" fontSize="12" fill="#6b7280">6</text>
              <text x="20" y="150" fontSize="12" fill="#6b7280">4</text>
              <text x="20" y="210" fontSize="12" fill="#6b7280">2</text>

              {/* Week 1 */}
              <rect x="100" y="130" width="50" height="80" fill="#2563eb" rx="4" />
              <rect x="155" y="140" width="50" height="70" fill="#cbd5e1" rx="4" />
              <text x="115" y="235" fontSize="12" fill="#6b7280" textAnchor="middle">Week 1</text>

              {/* Week 2 */}
              <rect x="240" y="120" width="50" height="90" fill="#2563eb" rx="4" />
              <rect x="295" y="140" width="50" height="70" fill="#cbd5e1" rx="4" />
              <text x="267" y="235" fontSize="12" fill="#6b7280" textAnchor="middle">Week 2</text>

              {/* Week 3 */}
              <rect x="380" y="110" width="50" height="100" fill="#2563eb" rx="4" />
              <rect x="435" y="140" width="50" height="70" fill="#cbd5e1" rx="4" />
              <text x="407" y="235" fontSize="12" fill="#6b7280" textAnchor="middle">Week 3</text>

              {/* Week 4 */}
              <rect x="520" y="100" width="50" height="110" fill="#2563eb" rx="4" />
              <rect x="575" y="140" width="50" height="70" fill="#cbd5e1" rx="4" />
              <text x="547" y="235" fontSize="12" fill="#6b7280" textAnchor="middle">Week 4</text>
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#2563eb" }} />
              <Text as="span" variant="bodySm">With ETA</Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "2px", background: "#cbd5e1" }} />
              <Text as="span" variant="bodySm">Without ETA</Text>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Top Performing Rules */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "20px" }}>Top Performing Rules</span>
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {topRules.map((rule, index) => (
              <div
                key={rule.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "16px",
                  borderBottom: index < topRules.length - 1 ? "1px solid #e5e7eb" : "none",
                }}
              >
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flex: 1 }}>
                  <span
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#6b7280",
                    }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      <span style={{ display: "block", marginBottom: "4px" }}>{rule.name}</span>
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {rule.impressions} impressions • {rule.conversions} conversions
                    </Text>
                  </div>
                </div>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "#d1fae5",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {rule.rate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Country Breakdown */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "20px" }}>Country Breakdown</span>
          </Text>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {countries.map((country, index) => (
              <div key={index}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{country.flag}</span>
                    <Text as="p" variant="bodyMd" fontWeight="medium">
                      {country.name}
                    </Text>
                  </div>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {country.count} ({country.percentage})
                  </Text>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: country.percentage,
                      height: "100%",
                      background: "#2563eb",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Analytics Banner */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #e5e7eb",
          display: "flex",
          gap: "24px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "12px",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Advanced Analytics Coming Soon</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Get deeper insights with A/B testing, heatmaps, customer segments, and more detailed conversion tracking.
          </Text>
        </div>
        <Button variant="primary">Join Waitlist</Button>
      </div>
    </div>
  );
}
