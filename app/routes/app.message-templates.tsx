import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { Text, Button, Icon } from "@shopify/polaris";
import {
  DeliveryIcon,
  PackageIcon,
  ClockIcon,
  PlanIcon,
  ProductIcon,
  CalendarIcon,
  GlobeIcon,
  StarFilledIcon
} from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get store
  const store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) {
    return json({
      templates: [],
      activeTemplateId: null,
      userPlan: "free",
    });
  }

  // Get all templates
  const templates = await db.messageTemplate.findMany({
    where: {
      OR: [
        { isBuiltIn: true, storeId: null },
        { storeId: store.id },
      ],
    },
    orderBy: [
      { isPro: "asc" },
      { createdAt: "asc" },
    ],
  });

  return json({
    templates,
    activeTemplateId: store.activeTemplateId,
    userPlan: store.plan || "free",
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const action = formData.get("action") as string;
    const templateId = formData.get("templateId") as string;

    // Get store
    const store = await db.store.findUnique({
      where: { shop: session.shop },
    });

    if (!store) {
      return json({ success: false, error: "Store not found" }, { status: 404 });
    }

    // Get template
    const template = await db.messageTemplate.findUnique({
      where: { templateId },
    });

    if (!template) {
      return json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Check Pro requirement
    if (template.isPro && store.plan === "free") {
      return json(
        { success: false, code: "UPGRADE_REQUIRED", error: "This template requires a Pro plan" },
        { status: 403 }
      );
    }

    // Apply template
    await db.store.update({
      where: { id: store.id },
      data: { activeTemplateId: templateId },
    });

    return json({
      success: true,
      message: "Template applied successfully",
    });
  } catch (error) {
    console.error("Error applying template:", error);
    return json({ success: false, error: "Failed to apply template" }, { status: 500 });
  }
}

export default function MessageTemplates() {
  const { templates, activeTemplateId, userPlan } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [selectedTemplate, setSelectedTemplate] = useState(activeTemplateId);

  const isProPlan = userPlan === "pro" || userPlan === "advanced";

  const handleApplyTemplate = (templateId: string, isPro: boolean) => {
    if (isPro && !isProPlan) {
      // TODO: Create plans page
      alert("This template requires a Pro plan. Upgrade feature coming soon!");
      return;
    }

    const formData = new FormData();
    formData.append("action", "apply");
    formData.append("templateId", templateId);

    submit(formData, { method: "post" });
    setSelectedTemplate(templateId);
  };

  // Helper function to get tone colors
  const getToneColors = (tone: string) => {
    const toneColors: Record<string, { bg: string; color: string }> = {
      info: { bg: "#dbeafe", color: "#2563eb" },
      success: { bg: "#d1fae5", color: "#10b981" },
      warning: { bg: "#fef3c7", color: "#f59e0b" },
    };
    return toneColors[tone] || toneColors.info;
  };

  // Helper function to get icon component
  const getIconComponent = (iconName: string | null) => {
    const iconMap: Record<string, any> = {
      "🚀": DeliveryIcon,
      "📦": PackageIcon,
      "⏰": ClockIcon,
      "✈️": PlanIcon,
      "🎄": ProductIcon,
      "📅": CalendarIcon,
      "🌍": GlobeIcon,
      "⚡": StarFilledIcon,
    };
    return iconMap[iconName || ""] || PackageIcon;
  };

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Message Templates
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Pre-built ETA message templates ready to use
        </Text>
      </div>

      {/* Templates Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "24px" }}>
        {templates.map((template) => {
          const toneColors = getToneColors(template.toneDefault);
          const isSelected = selectedTemplate === template.templateId;
          const isLocked = template.isPro && !isProPlan;

          return (
            <div
              key={template.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
                position: "relative",
                opacity: isLocked ? 0.7 : 1,
              }}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#10b981",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  SELECTED
                </div>
              )}

              {/* Pro Badge */}
              {template.isPro && (
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    padding: "4px 12px",
                    background: "#f59e0b",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: "600", color: "white" }}>Pro</span>
                </div>
              )}

              {/* Icon */}
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  background: toneColors.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  marginTop: template.isPro || isSelected ? "20px" : "0",
                }}
              >
                <Icon source={getIconComponent(template.icon)} tone="base" />
              </div>

              {/* Title & Description */}
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                <span style={{ display: "block", marginBottom: "4px" }}>{template.name}</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <span style={{ display: "block", marginBottom: "16px" }}>{template.description}</span>
              </Text>

              {/* Message Preview */}
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: toneColors.bg,
                  border: `1px solid ${toneColors.color}`,
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Icon source={getIconComponent(template.icon)} tone="base" />
                <Text as="span" variant="bodySm" fontWeight="medium">
                  <span style={{ color: toneColors.color }}>{template.message}</span>
                </Text>
              </div>

              {/* Button */}
              <Button
                fullWidth
                variant={isSelected ? "plain" : "primary"}
                disabled={isLoading || isSelected}
                onClick={() => handleApplyTemplate(template.templateId, template.isPro)}
              >
                {isLocked ? "Upgrade to Use" : isSelected ? "Selected" : "Use Template"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Unlock Pro Templates Banner - Only for Free users */}
      {!isProPlan && (
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            borderRadius: "16px",
            padding: "40px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1 }}>
            <Text as="h2" variant="headingLg" fontWeight="bold">
              <span style={{ color: "white", display: "block", marginBottom: "8px" }}>
                Unlock Pro Templates
              </span>
            </Text>
            <Text as="p" variant="bodyMd">
              <span style={{ color: "rgba(255, 255, 255, 0.9)", display: "block", marginBottom: "20px" }}>
                Get access to premium message templates, seasonal variations, and custom branding options.
              </span>
            </Text>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => alert("Pro plan upgrade coming soon!")}
                style={{
                  padding: "12px 24px",
                  background: "white",
                  border: "none",
                  borderRadius: "8px",
                  color: "#2563eb",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => alert("Documentation coming soon!")}
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  border: "2px solid white",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Learn More
              </button>
            </div>
          </div>
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "16px",
              marginLeft: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
            }}
          >
            ⭐
          </div>
        </div>
      )}

      {/* Create Custom Template */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "32px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          <span style={{ display: "block", marginBottom: "8px" }}>Create Custom Template</span>
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          <span style={{ display: "block", marginBottom: "20px" }}>
            Need a specific message format? Create your own template with custom variables and styling.
          </span>
        </Text>
        <Button variant="primary" onClick={() => alert("Custom template creation coming soon!")}>Create Custom Template</Button>
      </div>

      {/* Feature Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {/* Dynamic Variables */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Dynamic Variables</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            All templates support dynamic date calculations and timezone awareness
          </Text>
        </div>

        {/* Multi-Language */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Multi-Language</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Translate templates into any language your store supports
          </Text>
        </div>

        {/* Instant Preview */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "8px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Instant Preview</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            See exactly how your message will look before applying
          </Text>
        </div>
      </div>
    </div>
  );
}
