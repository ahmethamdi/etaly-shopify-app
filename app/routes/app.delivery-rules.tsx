import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import {
  Text,
  TextField,
  Select,
  Badge,
  Button,
  Modal,
  FormLayout,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    // Get or create store
    const store = await db.store.findUnique({
      where: { shop },
      include: {
        deliveryRules: {
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!store) {
      // Create store if it doesn't exist
      await db.store.create({
        data: {
          shop,
          plan: "free",
          isActive: true,
        },
      });

      // Return empty rules for new store
      return json({
        shop: session.shop,
        deliveryRules: [],
      });
    }

    // Manually fetch rules with template and product count
    const deliveryRules = await Promise.all(
      store.deliveryRules.map(async (rule: any) => {
        const template = rule.templateId
          ? await db.messageTemplate.findUnique({
              where: { templateId: rule.templateId }
            })
          : null;

        const productCount = await db.productTargeting.count({
          where: { ruleId: rule.id }
        });

        const countries = JSON.parse(rule.countries);
        return {
          id: rule.id,
          name: rule.name,
          carrier: rule.carrier || "Not specified",
          location: countries.join(", "),
          deliveryTime: `${rule.minDays}-${rule.maxDays} business days`,
          cutoffTime: rule.cutoffTime || "Not set",
          isActive: rule.isActive,
          template: template ? {
            templateId: template.templateId,
            name: template.name,
            icon: template.icon,
            toneDefault: template.toneDefault,
          } : null,
          productCount,
        };
      })
    );

    // Fetch available templates
    const templates = await db.messageTemplate.findMany({
      where: {
        OR: [
          { storeId: store.id },
          { isBuiltIn: true }
        ]
      },
      orderBy: { name: 'asc' }
    });

    return json({
      shop: session.shop,
      deliveryRules,
      templates,
      storePlan: store.plan, // Add store plan for feature restrictions
    });
  } catch (error) {
    console.error("Error loading delivery rules:", error);
    // Return empty array on error
    return json({
      shop: session.shop,
      deliveryRules: [],
      templates: [],
      storePlan: "free",
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

    // CREATE
    if (actionType === "create") {
      const name = formData.get("name") as string;
      const countries = formData.get("countries") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);
      const templateId = formData.get("templateId") as string;

      await db.deliveryRule.create({
        data: {
          storeId: store.id,
          name: name || "New Rule",
          countries: JSON.stringify([countries || "US"]),
          minDays: minDays || 2,
          maxDays: maxDays || 5,
          isActive: true,
          templateId: templateId || null,
        },
      });
      return json({ success: true, message: "Rule created successfully" });
    }

    // UPDATE
    if (actionType === "update" && ruleId) {
      const name = formData.get("name") as string;
      const countries = formData.get("countries") as string;
      const minDays = parseInt(formData.get("minDays") as string);
      const maxDays = parseInt(formData.get("maxDays") as string);
      const templateId = formData.get("templateId") as string;

      await db.deliveryRule.update({
        where: { id: ruleId },
        data: {
          name: name || "Updated Rule",
          countries: JSON.stringify([countries || "US"]),
          minDays: minDays || 2,
          maxDays: maxDays || 5,
          templateId: templateId || null,
        },
      });
      return json({ success: true, message: "Rule updated successfully" });
    }

    return json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Delivery rules action error:", error);
    return json({ success: false, error: "Failed to process action" }, { status: 500 });
  }
};


// Helper function to get icon SVG based on tone
const getTemplateIcon = (tone: string) => {
  switch (tone) {
    case "success":
      return (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      );
    case "warning":
      return (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      );
    case "info":
    default:
      return (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      );
  }
};

const getTemplateBgColor = (tone: string) => {
  switch (tone) {
    case "success":
      return { bg: "#d1fae5", color: "#059669" }; // Light green
    case "warning":
      return { bg: "#fef3c7", color: "#d97706" }; // Light amber
    case "info":
    default:
      return { bg: "#dbeafe", color: "#2563eb" }; // Light blue
  }
};

export default function DeliveryRules() {
  const { deliveryRules, templates, storePlan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [previewRule, setPreviewRule] = useState<any>(null);
  const [editRule, setEditRule] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    countries: "US",
    minDays: "2",
    maxDays: "5",
    templateId: "",
  });

  const handleToggle = (ruleId: string) => {
    const formData = new FormData();
    formData.append("action", "toggle");
    formData.append("ruleId", ruleId);
    fetcher.submit(formData, { method: "post" });
  };

  const handleDelete = (ruleId: string) => {
    setDeleteRuleId(ruleId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteRuleId) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("ruleId", deleteRuleId);
      fetcher.submit(formData, { method: "post" });
      setShowDeleteModal(false);
      setDeleteRuleId(null);
    }
  };

  const handleQuickCreate = () => {
    setShowCreateModal(true);
  };

  const handleSubmitRule = () => {
    const submitData = new FormData();
    submitData.append("action", "create");
    submitData.append("name", formData.name);
    submitData.append("countries", formData.countries);
    submitData.append("minDays", formData.minDays);
    submitData.append("maxDays", formData.maxDays);
    submitData.append("templateId", formData.templateId);
    fetcher.submit(submitData, { method: "post" });
    setShowCreateModal(false);
    setFormData({ name: "", countries: "US", minDays: "2", maxDays: "5", templateId: "" });
  };

  const handlePreview = (rule: any) => {
    setPreviewRule(rule);
    setShowPreviewModal(true);
  };

  const handleEdit = (rule: any) => {
    setEditRule(rule);
    setFormData({
      name: rule.name,
      countries: rule.location,
      minDays: rule.deliveryTime.split("-")[0].trim(),
      maxDays: rule.deliveryTime.split("-")[1].split(" ")[0].trim(),
      templateId: rule.template?.templateId || "",
    });
    setShowEditModal(true);
  };

  // Filter rules based on search query
  const filteredRules = deliveryRules.filter((rule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Search */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ position: "relative", maxWidth: "400px" }}>
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
              placeholder="Search rules by name, carrier, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>

      {/* Delivery Rules List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredRules.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "12px" }}>
            <Text as="p" variant="bodyMd" tone="subdued">
              {searchQuery ? "No rules found matching your search" : "No delivery rules yet. Create your first rule!"}
            </Text>
          </div>
        ) : (
          filteredRules.map((rule) => (
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
                <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "12px", flexWrap: "wrap" }}>
                  {/* Template */}
                  {rule.template && (() => {
                    const { bg, color } = getTemplateBgColor(rule.template.toneDefault);
                    return (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        background: bg,
                        borderRadius: "6px",
                      }}>
                        <div style={{ color }}>
                          {getTemplateIcon(rule.template.toneDefault)}
                        </div>
                        <Text as="span" variant="bodySm" fontWeight="medium">
                          <span style={{ color }}>{rule.template.name}</span>
                        </Text>
                      </div>
                    );
                  })()}

                  {/* Product Count */}
                  {rule.productCount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                        <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        <span style={{ color: "#2563eb" }}>{rule.productCount} {rule.productCount === 1 ? 'product' : 'products'}</span>
                      </Text>
                    </div>
                  )}

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
                  {(() => {
                    const { bg, color } = rule.template
                      ? getTemplateBgColor(rule.template.toneDefault)
                      : { bg: "#eef2ff", color: "#2563eb" }; // Default blue if no template

                    return (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: bg,
                        borderRadius: "6px",
                      }}>
                        <svg width="14" height="14" fill="none" stroke={color} viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                        <Text as="span" variant="bodySm" fontWeight="medium" tone="base">
                          <span style={{ color }}>Delivery: {rule.deliveryTime}</span>
                        </Text>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Right Side - Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* Preview Button (Eye) */}
                <button
                  onClick={() => handlePreview(rule)}
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
                  title="Preview rule details"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(rule)}
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
                  title="Edit rule"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>

                {/* Product Targeting Button */}
                <a
                  href={`/app/delivery-rules/${rule.id}/products`}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                  title={`Assign products to this rule (${rule.productCount} currently assigned)`}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                </a>

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
        )))}
      </div>

      {/* Create Rule Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Delivery Rule"
        primaryAction={{
          content: "Create Rule",
          onAction: handleSubmitRule,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowCreateModal(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Rule Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="e.g., Standard Shipping - Germany"
              autoComplete="off"
            />
            <TextField
              label="Country Code"
              value={formData.countries}
              onChange={(value) => setFormData({ ...formData, countries: value })}
              placeholder="e.g., US, DE, UK"
              helpText="Enter a country code (2 letters)"
              autoComplete="off"
            />
            <TextField
              label="Minimum Days"
              type="number"
              value={formData.minDays}
              onChange={(value) => setFormData({ ...formData, minDays: value })}
              autoComplete="off"
            />
            <TextField
              label="Maximum Days"
              type="number"
              value={formData.maxDays}
              onChange={(value) => setFormData({ ...formData, maxDays: value })}
              autoComplete="off"
            />
            <Select
              label="Message Template"
              options={[
                { label: "None (use default)", value: "" },
                ...templates.map((t: any) => {
                  const toneLabels: Record<string, string> = {
                    success: "✓",
                    warning: "⏰",
                    info: "📦"
                  };
                  const prefix = toneLabels[t.toneDefault] || "📋";
                  const isPro = t.isPro;
                  const isFree = storePlan === "free";
                  const isLocked = isPro && isFree;

                  return {
                    label: `${prefix} ${t.name}${isPro ? " 🔒 PRO" : ""}`,
                    value: t.templateId,
                    disabled: isLocked
                  };
                })
              ]}
              value={formData.templateId}
              onChange={(value) => setFormData({ ...formData, templateId: value })}
              helpText={storePlan === "free" ? "🔒 Upgrade to PRO to unlock premium templates" : "Choose which message template to use for this delivery rule"}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Delivery Rule"
        primaryAction={{
          content: "Delete",
          onAction: confirmDelete,
          loading: fetcher.state === "submitting",
          destructive: true,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowDeleteModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            Are you sure you want to delete this delivery rule? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Rule Details"
        primaryAction={{
          content: "Close",
          onAction: () => setShowPreviewModal(false),
        }}
      >
        <Modal.Section>
          {previewRule && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Rule Name</Text>
                <Text as="p" variant="bodyMd">{previewRule.name}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Carrier</Text>
                <Text as="p" variant="bodyMd">{previewRule.carrier}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Location</Text>
                <Text as="p" variant="bodyMd">{previewRule.location}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Delivery Time</Text>
                <Text as="p" variant="bodyMd">{previewRule.deliveryTime}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Cutoff Time</Text>
                <Text as="p" variant="bodyMd">{previewRule.cutoffTime}</Text>
              </div>
              <div>
                <Text as="p" variant="bodyMd" fontWeight="semibold">Status</Text>
                <Badge tone={previewRule.isActive ? "success" : "default"}>
                  {previewRule.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          )}
        </Modal.Section>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Delivery Rule"
        primaryAction={{
          content: "Save Changes",
          onAction: () => {
            if (editRule) {
              const submitData = new FormData();
              submitData.append("action", "update");
              submitData.append("ruleId", editRule.id);
              submitData.append("name", formData.name);
              submitData.append("countries", formData.countries);
              submitData.append("minDays", formData.minDays);
              submitData.append("maxDays", formData.maxDays);
              submitData.append("templateId", formData.templateId);
              fetcher.submit(submitData, { method: "post" });
              setShowEditModal(false);
              setFormData({ name: "", countries: "US", minDays: "2", maxDays: "5", templateId: "" });
            }
          },
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowEditModal(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Rule Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="e.g., Standard Shipping - Germany"
              autoComplete="off"
            />
            <TextField
              label="Country Code"
              value={formData.countries}
              onChange={(value) => setFormData({ ...formData, countries: value })}
              placeholder="e.g., US, DE, UK"
              helpText="Enter a country code (2 letters)"
              autoComplete="off"
            />
            <TextField
              label="Minimum Days"
              type="number"
              value={formData.minDays}
              onChange={(value) => setFormData({ ...formData, minDays: value })}
              autoComplete="off"
            />
            <TextField
              label="Maximum Days"
              type="number"
              value={formData.maxDays}
              onChange={(value) => setFormData({ ...formData, maxDays: value })}
              autoComplete="off"
            />
            <Select
              label="Message Template"
              options={[
                { label: "None (use default)", value: "" },
                ...templates.map((t: any) => {
                  const toneLabels: Record<string, string> = {
                    success: "✓",
                    warning: "⏰",
                    info: "📦"
                  };
                  const prefix = toneLabels[t.toneDefault] || "📋";
                  const isPro = t.isPro;
                  const isFree = storePlan === "free";
                  const isLocked = isPro && isFree;

                  return {
                    label: `${prefix} ${t.name}${isPro ? " 🔒 PRO" : ""}`,
                    value: t.templateId,
                    disabled: isLocked
                  };
                })
              ]}
              value={formData.templateId}
              onChange={(value) => setFormData({ ...formData, templateId: value })}
              helpText={storePlan === "free" ? "🔒 Upgrade to PRO to unlock premium templates" : "Choose which message template to use for this delivery rule"}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </div>
  );
}
