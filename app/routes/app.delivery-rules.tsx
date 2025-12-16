import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Text,
  TextField,
  Select,
  Badge,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    let store = await db.store.findUnique({
      where: { shop },
      include: {
        deliveryRules: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!store) {
      // Create store if it doesn't exist
      store = await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
        include: {
          deliveryRules: true,
        },
      });
    }

    // Transform data for frontend
    const deliveryRules = store.deliveryRules.map((rule) => {
      const countries = JSON.parse(rule.countries);
      return {
        id: rule.id,
        name: rule.name,
        carrier: rule.carrier || "Not specified",
        location: countries.join(", "),
        deliveryTime: `${rule.minDays}-${rule.maxDays} business days`,
        cutoffTime: rule.cutoffTime || "Not set",
        isActive: rule.isActive,
      };
    });

    return json({
      shop: session.shop,
      deliveryRules,
    });
  } catch (error) {
    console.error("Error loading delivery rules:", error);
    // Return empty array on error
    return json({
      shop: session.shop,
      deliveryRules: [],
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const store = await db.store.findUnique({ where: { shop } });
    if (!store) {
      return json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const actionType = formData.get("action") as string;
    const ruleId = formData.get("ruleId") as string;

    // TOGGLE ACTIVE/INACTIVE
    if (actionType === "toggle" && ruleId) {
      const rule = await db.deliveryRule.findUnique({ where: { id: ruleId } });
      if (rule) {
        await db.deliveryRule.update({
          where: { id: ruleId },
          data: { isActive: !rule.isActive },
        });
        return json({ success: true, message: "Rule status updated" });
      }
    }

    // DELETE
    if (actionType === "delete" && ruleId) {
      await db.deliveryRule.delete({ where: { id: ruleId } });
      return json({ success: true, message: "Rule deleted successfully" });
    }

    // CREATE (Simple version for now)
    if (actionType === "create") {
      const name = formData.get("name") as string;
      const countries = formData.get("countries") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);

      await db.deliveryRule.create({
        data: {
          storeId: store.id,
          name: name || "New Rule",
          countries: JSON.stringify([countries || "US"]),
          minDays: minDays || 2,
          maxDays: maxDays || 5,
          isActive: true,
        },
      });
      return json({ success: true, message: "Rule created successfully" });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Delivery rules action error:", error);
    return json({ success: false, error: "Failed to process action" }, { status: 500 });
  }
};

// Mock delivery rules data for initial display if no rules exist
const mockRules = [
    {
      id: "1",
      name: "Standard Shipping – Germany",
      carrier: "DHL Standard",
      location: "Germany",
      deliveryTime: "2-3 business days",
      cutoffTime: "14:00",
      isActive: true,
    },
    {
      id: "2",
      name: "Express Shipping – EU",
      carrier: "DPD Express",
      location: "European Union",
      deliveryTime: "1-2 business days",
      cutoffTime: "16:00",
      isActive: true,
    },
    {
      id: "3",
      name: "Economy Shipping – Worldwide",
      carrier: "Standard Post",
      location: "International",
      deliveryTime: "5-10 business days",
      cutoffTime: "12:00",
      isActive: false,
    },
    {
      id: "4",
      name: "Same Day – Berlin",
      carrier: "Local Courier",
      location: "Germany",
      deliveryTime: "Same day",
      cutoffTime: "11:00",
      isActive: true,
    },
    {
      id: "5",
      name: "Premium Shipping – Austria",
      carrier: "UPS Express",
      location: "Austria",
      deliveryTime: "1-2 business days",
      cutoffTime: "15:00",
      isActive: true,
    },
  ];

  return {
    shop: session.shop,
    deliveryRules,
  };
};

export default function DeliveryRules() {
  const { deliveryRules } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleToggle = (ruleId: string) => {
    const formData = new FormData();
    formData.append("action", "toggle");
    formData.append("ruleId", ruleId);
    fetcher.submit(formData, { method: "post" });
  };

  const handleDelete = (ruleId: string) => {
    if (confirm("Are you sure you want to delete this rule?")) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("ruleId", ruleId);
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleQuickCreate = () => {
    const name = prompt("Enter rule name:", "New Delivery Rule");
    if (name) {
      const formData = new FormData();
      formData.append("action", "create");
      formData.append("name", name);
      formData.append("countries", "US");
      formData.append("minDays", "2");
      formData.append("maxDays", "5");
      fetcher.submit(formData, { method: "post" });
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <Text as="h1" variant="headingLg" fontWeight="bold">
              Delivery Rules
            </Text>
            <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
              Manage your delivery estimations and cutoff times
            </Text>
          </div>
          <Button variant="primary" onClick={handleQuickCreate} loading={fetcher.state === "submitting"}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", lineHeight: "1" }}>+</span>
              <span>Create Rule</span>
            </div>
          </Button>
        </div>

        {/* Search and Filters */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          <div style={{ flex: "1" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280",
                pointerEvents: "none"
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search rules..."
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div style={{ width: "200px" }}>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>All Countries</option>
              <option>Germany</option>
              <option>Austria</option>
              <option>European Union</option>
              <option>International</option>
            </select>
          </div>
          <div style={{ width: "200px" }}>
            <select
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Delivery Rules List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {deliveryRules.map((rule) => (
          <div
            key={rule.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "20px 24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              {/* Left Side - Rule Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <Text as="h3" variant="headingMd" fontWeight="semibold">
                    {rule.name}
                  </Text>
                  <Badge tone={rule.isActive ? "success" : "default"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Rule Details */}
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "12px" }}>
                  {/* Location */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {rule.location}
                    </Text>
                  </div>

                  {/* Carrier */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <Text as="span" variant="bodySm" tone="subdued">
                      {rule.carrier}
                    </Text>
                  </div>

                  {/* Cutoff Time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <Text as="span" variant="bodySm" tone="subdued">
                      Cutoff: {rule.cutoffTime}
                    </Text>
                  </div>
                </div>

                {/* Delivery Time Badge */}
                <div style={{ marginTop: "12px" }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    background: "#eef2ff",
                    borderRadius: "6px",
                  }}>
                    <svg width="14" height="14" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <Text as="span" variant="bodySm" fontWeight="medium" tone="base">
                      <span style={{ color: "#2563eb" }}>Delivery: {rule.deliveryTime}</span>
                    </Text>
                  </div>
                </div>
              </div>

              {/* Right Side - Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Edit Button */}
                <button
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Duplicate Button */}
                <button
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>

                {/* Preview Button */}
                <button
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(rule.id)}
                  disabled={fetcher.state === "submitting"}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: fetcher.state === "submitting" ? "not-allowed" : "pointer",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: fetcher.state === "submitting" ? 0.5 : 1,
                  }}
                  title="Delete rule"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>

                {/* Toggle Switch */}
                <label
                  onClick={() => handleToggle(rule.id)}
                  style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", marginLeft: "8px", cursor: "pointer" }}
                >
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
