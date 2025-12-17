import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Button, Badge } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Mock countries data
  const countries = [
    {
      id: "1",
      name: "Germany",
      flag: "🇩🇪",
      region: "Europe/Berlin",
      rulesCount: 2,
      isActive: true,
      isExpanded: true,
      rules: [
        {
          id: "1",
          carrier: "DHL Standard",
          cutoff: "14:00",
          delivery: "2-3 days",
          isActive: true,
        },
        {
          id: "2",
          carrier: "DPD Express",
          cutoff: "16:00",
          delivery: "1-2 days",
          isActive: true,
        },
      ],
    },
    {
      id: "2",
      name: "Austria",
      flag: "🇦🇹",
      region: "Europe/Vienna",
      rulesCount: 1,
      isActive: true,
      isExpanded: true,
      rules: [
        {
          id: "1",
          carrier: "Austrian Post",
          cutoff: "15:00",
          delivery: "2-4 days",
          isActive: true,
        },
      ],
    },
    {
      id: "3",
      name: "Switzerland",
      flag: "🇨🇭",
      region: "Europe/Zurich",
      rulesCount: 1,
      isActive: false,
      isExpanded: false,
      rules: [],
    },
    {
      id: "4",
      name: "United Kingdom",
      flag: "🇬🇧",
      region: "Europe/London",
      rulesCount: 0,
      isActive: false,
      isExpanded: false,
      rules: [],
    },
    {
      id: "5",
      name: "France",
      flag: "🇫🇷",
      region: "Europe/Paris",
      rulesCount: 0,
      isActive: false,
      isExpanded: false,
      rules: [],
    },
  ];

  return {
    shop: session.shop,
    countries,
  };
};

export default function MultiCountry() {
  const { countries } = useLoaderData<typeof loader>();

  const activeCountries = countries.filter((c) => c.isActive);
  const inactiveCountries = countries.filter((c) => !c.isActive);

  const totalRules = countries.reduce((sum, c) => sum + c.rulesCount, 0);
  const coverage = 60; // Mock coverage percentage

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <Text as="h1" variant="headingLg" fontWeight="bold">
              Multi-Country Setup
            </Text>
            <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
              Configure delivery rules for different countries and regions
            </Text>
          </div>
          <Button variant="primary">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
              <span>Add Country</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "24px" }}>
        {/* Left Column - Countries List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Active Countries */}
          {activeCountries.map((country) => (
            <div
              key={country.id}
              style={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Country Header */}
              <div
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="#6b7280"
                      viewBox="0 0 24 24"
                      style={{
                        strokeWidth: "2",
                        transform: country.isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <span style={{ fontSize: "24px" }}>{country.flag}</span>
                  <div>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {country.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {country.region}
                    </Text>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {country.rulesCount} {country.rulesCount === 1 ? "rule" : "rules"}
                  </Text>
                  <Badge tone={country.isActive ? "success" : "default"}>
                    {country.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Country Rules (Expanded) */}
              {country.isExpanded && country.rules.length > 0 && (
                <div style={{ borderTop: "1px solid #e5e7eb" }}>
                  {country.rules.map((rule, index) => (
                    <div
                      key={rule.id}
                      style={{
                        padding: "20px 24px 20px 64px",
                        borderBottom: index < country.rules.length - 1 ? "1px solid #f3f4f6" : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                          <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          <Text as="p" variant="bodyMd" fontWeight="medium">
                            {rule.carrier}
                          </Text>
                          <Badge tone="success">Active</Badge>
                        </div>
                        <div style={{ display: "flex", gap: "16px", marginLeft: "28px" }}>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Cutoff: {rule.cutoff}
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            •
                          </Text>
                          <Text as="span" variant="bodySm" tone="subdued">
                            Delivery: {rule.delivery}
                          </Text>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          style={{
                            padding: "8px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          style={{
                            padding: "8px",
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Add Another Rule Button */}
                  <button
                    style={{
                      width: "100%",
                      padding: "16px 24px 16px 64px",
                      background: "transparent",
                      border: "2px dashed #d1d5db",
                      borderRadius: "0 0 12px 12px",
                      cursor: "pointer",
                      color: "#6b7280",
                      fontSize: "14px",
                      textAlign: "center",
                      transition: "all 0.2s",
                    }}
                  >
                    + Add Another Rule
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Inactive Countries */}
          {inactiveCountries.map((country) => (
            <div
              key={country.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px 24px",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="#6b7280"
                      viewBox="0 0 24 24"
                      style={{ strokeWidth: "2" }}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                  <span style={{ fontSize: "24px" }}>{country.flag}</span>
                  <div>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {country.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {country.region}
                    </Text>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {country.rulesCount} {country.rulesCount === 1 ? "rule" : "rules"}
                  </Text>
                  <Badge tone="default">Inactive</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Stats & Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Stats */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Quick Stats
            </Text>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Total Countries
                </Text>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  {countries.length}
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Active Rules
                </Text>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  {totalRules}
                </Text>
              </div>
              <div style={{ height: "1px", background: "#e5e7eb" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Text as="p" variant="bodySm" tone="subdued">
                  Coverage
                </Text>
                <Text as="p" variant="headingLg" fontWeight="bold">
                  <span style={{ color: "#10b981" }}>{coverage}%</span>
                </Text>
              </div>
            </div>
          </div>

          {/* Auto-Detection */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Auto-Detection
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ marginTop: "8px", display: "block" }}>
                Timezone and holiday calendars are automatically set based on the country you select.
              </span>
            </Text>
            <div style={{ marginTop: "16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <input
                type="checkbox"
                defaultChecked
                style={{
                  width: "20px",
                  height: "20px",
                  marginTop: "2px",
                  cursor: "pointer",
                  accentColor: "#2563eb",
                }}
              />
              <div>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  Auto-detect timezone
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Use country's default timezone
                </Text>
              </div>
            </div>
          </div>

          {/* International Shipping */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <Text as="h3" variant="bodyMd" fontWeight="semibold">
                <span style={{ color: "#2563eb" }}>International Shipping</span>
              </Text>
            </div>
            <Text as="p" variant="bodySm" tone="subdued">
              Set up rules for multiple countries to show accurate delivery dates worldwide.
            </Text>
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
              Learn more about multi-country setup
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Popular Regions */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Popular Regions
            </Text>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🇪🇺</span>
                <Text as="p" variant="bodyMd">
                  European Union (27 countries)
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🌍</span>
                <Text as="p" variant="bodyMd">
                  Worldwide
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
