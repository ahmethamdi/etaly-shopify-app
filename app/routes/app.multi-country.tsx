import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Text, Button, Badge, Modal, TextField, Select, Icon } from "@shopify/polaris";
import { GlobeIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

// Country list with timezones
const COUNTRIES = [
  { code: "DE", name: "Germany", timezone: "Europe/Berlin" },
  { code: "AT", name: "Austria", timezone: "Europe/Vienna" },
  { code: "CH", name: "Switzerland", timezone: "Europe/Zurich" },
  { code: "GB", name: "United Kingdom", timezone: "Europe/London" },
  { code: "FR", name: "France", timezone: "Europe/Paris" },
  { code: "IT", name: "Italy", timezone: "Europe/Rome" },
  { code: "ES", name: "Spain", timezone: "Europe/Madrid" },
  { code: "NL", name: "Netherlands", timezone: "Europe/Amsterdam" },
  { code: "BE", name: "Belgium", timezone: "Europe/Brussels" },
  { code: "PL", name: "Poland", timezone: "Europe/Warsaw" },
  { code: "SE", name: "Sweden", timezone: "Europe/Stockholm" },
  { code: "NO", name: "Norway", timezone: "Europe/Oslo" },
  { code: "DK", name: "Denmark", timezone: "Europe/Copenhagen" },
  { code: "FI", name: "Finland", timezone: "Europe/Helsinki" },
  { code: "US", name: "United States", timezone: "America/New_York" },
  { code: "CA", name: "Canada", timezone: "America/Toronto" },
  { code: "AU", name: "Australia", timezone: "Australia/Sydney" },
  { code: "NZ", name: "New Zealand", timezone: "Pacific/Auckland" },
  { code: "JP", name: "Japan", timezone: "Asia/Tokyo" },
  { code: "CN", name: "China", timezone: "Asia/Shanghai" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get store
  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  // Get all delivery rules
  const deliveryRules = await db.deliveryRule.findMany({
    where: { storeId: store.id },
    orderBy: { priority: "asc" },
  });

  // Group rules by country
  const countryGroups: { [key: string]: any[] } = {};

  deliveryRules.forEach((rule) => {
    const countries = JSON.parse(rule.countries || "[]");
    countries.forEach((countryCode: string) => {
      if (!countryGroups[countryCode]) {
        countryGroups[countryCode] = [];
      }
      countryGroups[countryCode].push({
        id: rule.id,
        carrier: rule.carrier || "Standard Shipping",
        shippingMethod: rule.shippingMethod,
        cutoff: rule.cutoffTime || "14:00",
        minDays: rule.minDays,
        maxDays: rule.maxDays,
        isActive: rule.isActive,
      });
    });
  });

  // Build countries array
  const countries = COUNTRIES.map((country) => {
    const rules = countryGroups[country.code] || [];
    return {
      code: country.code,
      name: country.name,
      timezone: country.timezone,
      rulesCount: rules.length,
      isActive: rules.length > 0 && rules.some(r => r.isActive),
      rules,
    };
  });

  return json({
    shop: session.shop,
    countries,
    storeId: store.id,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    return json({ error: "Store not found" }, { status: 404 });
  }

  try {
    if (action === "createRule") {
      const countryCode = formData.get("countryCode") as string;
      const carrier = formData.get("carrier") as string;
      const cutoffTime = formData.get("cutoffTime") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);

      await db.deliveryRule.create({
        data: {
          storeId: store.id,
          name: `${carrier} - ${countryCode}`,
          carrier,
          cutoffTime,
          minDays,
          maxDays,
          countries: JSON.stringify([countryCode]),
          cutoffTimezone: COUNTRIES.find(c => c.code === countryCode)?.timezone || "UTC",
          isActive: true,
        },
      });

      return json({ success: true });
    }

    if (action === "deleteRule") {
      const ruleId = formData.get("ruleId") as string;

      await db.deliveryRule.delete({
        where: { id: ruleId },
      });

      return json({ success: true });
    }

    if (action === "toggleRule") {
      const ruleId = formData.get("ruleId") as string;
      const isActive = formData.get("isActive") === "true";

      await db.deliveryRule.update({
        where: { id: ruleId },
        data: { isActive: !isActive },
      });

      return json({ success: true });
    }

    if (action === "updateRule") {
      const ruleId = formData.get("ruleId") as string;
      const carrier = formData.get("carrier") as string;
      const cutoffTime = formData.get("cutoffTime") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);

      await db.deliveryRule.update({
        where: { id: ruleId },
        data: {
          carrier,
          cutoffTime,
          minDays,
          maxDays,
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

export default function MultiCountry() {
  const { countries, storeId } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  // State for modals
  const [showAddCountryModal, setShowAddCountryModal] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [editingRule, setEditingRule] = useState<any>(null);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());

  // Form state for add rule
  const [carrier, setCarrier] = useState("DHL Standard");
  const [cutoffTime, setCutoffTime] = useState("14:00");
  const [minDays, setMinDays] = useState("2");
  const [maxDays, setMaxDays] = useState("5");

  const activeCountries = countries.filter((c) => c.isActive);
  const inactiveCountries = countries.filter((c) => !c.isActive);

  const totalRules = countries.reduce((sum, c) => sum + c.rulesCount, 0);
  const coverage = Math.round((activeCountries.length / countries.length) * 100);

  const toggleCountry = (countryCode: string) => {
    const newSet = new Set(expandedCountries);
    if (newSet.has(countryCode)) {
      newSet.delete(countryCode);
    } else {
      newSet.add(countryCode);
    }
    setExpandedCountries(newSet);
  };

  const handleAddRule = () => {
    const formData = new FormData();
    formData.append("action", "createRule");
    formData.append("countryCode", selectedCountry);
    formData.append("carrier", carrier);
    formData.append("cutoffTime", cutoffTime);
    formData.append("minDays", minDays);
    formData.append("maxDays", maxDays);
    fetcher.submit(formData, { method: "post" });
    setShowAddRuleModal(false);
    setCarrier("DHL Standard");
    setCutoffTime("14:00");
    setMinDays("2");
    setMaxDays("5");
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;

    const formData = new FormData();
    formData.append("action", "updateRule");
    formData.append("ruleId", editingRule.id);
    formData.append("carrier", carrier);
    formData.append("cutoffTime", cutoffTime);
    formData.append("minDays", minDays);
    formData.append("maxDays", maxDays);
    fetcher.submit(formData, { method: "post" });
    setShowEditRuleModal(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm("Are you sure you want to delete this delivery rule?")) {
      const formData = new FormData();
      formData.append("action", "deleteRule");
      formData.append("ruleId", ruleId);
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    const formData = new FormData();
    formData.append("action", "toggleRule");
    formData.append("ruleId", ruleId);
    formData.append("isActive", String(isActive));
    fetcher.submit(formData, { method: "post" });
  };

  const openEditModal = (rule: any, countryCode: string) => {
    setEditingRule({ ...rule, countryCode });
    setCarrier(rule.carrier);
    setCutoffTime(rule.cutoff);
    setMinDays(String(rule.minDays));
    setMaxDays(String(rule.maxDays));
    setShowEditRuleModal(true);
  };

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
          <Button variant="primary" onClick={() => setShowAddCountryModal(true)}>
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
          {activeCountries.map((country) => {
            const isExpanded = expandedCountries.has(country.code);

            return (
              <div
                key={country.code}
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
                  onClick={() => toggleCountry(country.code)}
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
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        background: "#dbeafe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon source={GlobeIcon} tone="base" />
                    </div>
                    <div>
                      <Text as="h3" variant="headingMd" fontWeight="semibold">
                        {country.name}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {country.timezone}
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
                {isExpanded && country.rules.length > 0 && (
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
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleRule(rule.id, rule.isActive);
                              }}
                              style={{ cursor: "pointer" }}
                            >
                              <Badge tone={rule.isActive ? "success" : "default"}>
                                {rule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "16px", marginLeft: "28px" }}>
                            <Text as="span" variant="bodySm" tone="subdued">
                              Cutoff: {rule.cutoff}
                            </Text>
                            <Text as="span" variant="bodySm" tone="subdued">
                              •
                            </Text>
                            <Text as="span" variant="bodySm" tone="subdued">
                              Delivery: {rule.minDays}-{rule.maxDays} days
                            </Text>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(rule, country.code);
                            }}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRule(rule.id);
                            }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCountry(country.code);
                        setShowAddRuleModal(true);
                      }}
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
            );
          })}

          {/* Inactive Countries */}
          {inactiveCountries.map((country) => (
            <div
              key={country.code}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px 24px",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedCountry(country.code);
                setShowAddRuleModal(true);
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
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon source={GlobeIcon} tone="base" />
                  </div>
                  <div>
                    <Text as="h3" variant="headingMd" fontWeight="semibold">
                      {country.name}
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      {country.timezone}
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
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon source={GlobeIcon} tone="base" />
                </div>
                <Text as="p" variant="bodyMd">
                  European Union ({activeCountries.filter(c => ["DE", "AT", "FR", "IT", "ES", "NL", "BE", "PL", "SE", "DK", "FI"].includes(c.code)).length} countries active)
                </Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon source={GlobeIcon} tone="base" />
                </div>
                <Text as="p" variant="bodyMd">
                  Worldwide ({activeCountries.length}/{countries.length} countries)
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Country Modal */}
      <Modal
        open={showAddCountryModal}
        onClose={() => setShowAddCountryModal(false)}
        title="Select Country"
        primaryAction={{
          content: "Continue",
          onAction: () => {
            setShowAddCountryModal(false);
            setShowAddRuleModal(true);
          },
          disabled: !selectedCountry,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowAddCountryModal(false);
              setSelectedCountry("");
            },
          },
        ]}
      >
        <Modal.Section>
          <Select
            label="Country"
            options={[
              { label: "Select a country", value: "" },
              ...COUNTRIES.map((c) => ({
                label: c.name,
                value: c.code,
              })),
            ]}
            value={selectedCountry}
            onChange={setSelectedCountry}
          />
        </Modal.Section>
      </Modal>

      {/* Add Rule Modal */}
      <Modal
        open={showAddRuleModal}
        onClose={() => {
          setShowAddRuleModal(false);
          setCarrier("DHL Standard");
          setCutoffTime("14:00");
          setMinDays("2");
          setMaxDays("5");
        }}
        title={`Add Delivery Rule - ${COUNTRIES.find(c => c.code === selectedCountry)?.name || ""}`}
        primaryAction={{
          content: "Create Rule",
          onAction: handleAddRule,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowAddRuleModal(false),
          },
        ]}
      >
        <Modal.Section>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              label="Carrier Name"
              value={carrier}
              onChange={setCarrier}
              autoComplete="off"
              placeholder="e.g., DHL Standard, UPS Express"
            />
            <TextField
              label="Cutoff Time"
              type="time"
              value={cutoffTime}
              onChange={setCutoffTime}
              autoComplete="off"
              helpText="Orders placed before this time ship same day"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <TextField
                label="Min Delivery Days"
                type="number"
                value={minDays}
                onChange={setMinDays}
                autoComplete="off"
                min={0}
              />
              <TextField
                label="Max Delivery Days"
                type="number"
                value={maxDays}
                onChange={setMaxDays}
                autoComplete="off"
                min={0}
              />
            </div>
          </div>
        </Modal.Section>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal
        open={showEditRuleModal}
        onClose={() => {
          setShowEditRuleModal(false);
          setEditingRule(null);
        }}
        title="Edit Delivery Rule"
        primaryAction={{
          content: "Save Changes",
          onAction: handleUpdateRule,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowEditRuleModal(false);
              setEditingRule(null);
            },
          },
        ]}
      >
        <Modal.Section>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField
              label="Carrier Name"
              value={carrier}
              onChange={setCarrier}
              autoComplete="off"
            />
            <TextField
              label="Cutoff Time"
              type="time"
              value={cutoffTime}
              onChange={setCutoffTime}
              autoComplete="off"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <TextField
                label="Min Delivery Days"
                type="number"
                value={minDays}
                onChange={setMinDays}
                autoComplete="off"
                min={0}
              />
              <TextField
                label="Max Delivery Days"
                type="number"
                value={maxDays}
                onChange={setMaxDays}
                autoComplete="off"
                min={0}
              />
            </div>
          </div>
        </Modal.Section>
      </Modal>
    </div>
  );
}
