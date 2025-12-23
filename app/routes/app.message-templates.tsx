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
    <div style={{
      padding: "32px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: "absolute",
        top: "-50%",
        right: "-10%",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 20s ease-in-out infinite",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-30%",
        left: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        animation: "float 25s ease-in-out infinite reverse",
        pointerEvents: "none"
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .template-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .template-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Header */}
      <div style={{
        marginBottom: "40px",
        position: "relative",
        zIndex: 1,
        animation: "slideUp 0.6s ease-out"
      }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          <span style={{
            color: "white",
            fontSize: "36px",
            textShadow: "0 2px 20px rgba(0,0,0,0.2)",
            background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Premium Message Templates
          </span>
        </Text>
        <Text as="p" variant="bodySm" fontWeight="regular">
          <span style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "15px",
            display: "block",
            marginTop: "8px"
          }}>
            Choose from our collection of professionally designed ETA templates
          </span>
        </Text>
      </div>

      {/* Templates Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "28px",
        marginBottom: "32px",
        position: "relative",
        zIndex: 1
      }}>
        {templates.map((template, index) => {
          const toneColors = getToneColors(template.toneDefault);
          const isSelected = selectedTemplate === template.templateId;
          const isLocked = template.isPro && !isProPlan;

          return (
            <div
              key={template.id}
              className="template-card"
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)"
                  : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "28px",
                border: isSelected
                  ? "2px solid rgba(102, 126, 234, 0.5)"
                  : "1px solid rgba(255, 255, 255, 0.3)",
                position: "relative",
                boxShadow: isSelected
                  ? "0 8px 32px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255,255,255,0.1) inset"
                  : "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255,255,255,0.1) inset",
                cursor: "pointer",
                animation: `slideUp 0.6s ease-out ${index * 0.1}s backwards`,
                opacity: isLocked ? 0.85 : 1,
              }}
              onClick={() => !isLocked && handleApplyTemplate(template.templateId, template.isPro)}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                >
                  ✓ ACTIVE
                </div>
              )}

              {/* Pro Badge */}
              {template.isPro && (
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                    padding: "6px 14px",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "white", letterSpacing: "0.5px" }}>PRO</span>
                </div>
              )}

              {/* Icon */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg, ${toneColors.bg} 0%, ${toneColors.color}22 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                  marginTop: template.isPro || isSelected ? "32px" : "0",
                  boxShadow: `0 8px 16px ${toneColors.color}20`,
                  border: `2px solid ${toneColors.color}30`,
                }}
              >
                <Icon source={getIconComponent(template.icon)} tone="base" />
              </div>

              {/* Title & Description */}
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                <span style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1f2937",
                  letterSpacing: "-0.5px"
                }}>
                  {template.name}
                </span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <span style={{
                  display: "block",
                  marginBottom: "20px",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}>
                  {template.description}
                </span>
              </Text>

              {/* Message Preview */}
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  background: `linear-gradient(135deg, ${toneColors.bg} 0%, ${toneColors.color}15 100%)`,
                  border: `2px solid ${toneColors.color}40`,
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: `0 4px 12px ${toneColors.color}15`,
                }}
              >
                <Icon source={getIconComponent(template.icon)} tone="base" />
                <Text as="span" variant="bodySm" fontWeight="medium">
                  <span style={{
                    color: toneColors.color,
                    fontSize: "13px",
                    fontWeight: "600",
                    lineHeight: "1.5"
                  }}>
                    {template.message}
                  </span>
                </Text>
              </div>

              {/* Button */}
              <button
                disabled={isLoading || isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLocked) handleApplyTemplate(template.templateId, template.isPro);
                }}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  borderRadius: "12px",
                  border: "none",
                  background: isSelected
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : isLocked
                    ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: isLoading || isSelected ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                    : "0 4px 12px rgba(102, 126, 234, 0.3)",
                  letterSpacing: "0.5px",
                  opacity: isLoading || isSelected ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isSelected) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = isSelected
                    ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                    : "0 4px 12px rgba(102, 126, 234, 0.3)";
                }}
              >
                {isLocked ? "🔒 Upgrade to Pro" : isSelected ? "✓ Active Template" : "Select Template"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Unlock Pro Templates Banner - Only for Free users */}
      {!isProPlan && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "48px",
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            position: "relative",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #f59e0b, #d97706, #f59e0b)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite"
          }} />

          <div style={{ flex: 1 }}>
            <Text as="h2" variant="headingLg" fontWeight="bold">
              <span style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "28px",
                fontWeight: "800",
                display: "block",
                marginBottom: "12px",
              }}>
                ⚡ Unlock Pro Templates
              </span>
            </Text>
            <Text as="p" variant="bodyMd">
              <span style={{
                color: "#4b5563",
                display: "block",
                marginBottom: "24px",
                fontSize: "15px",
                lineHeight: "1.7"
              }}>
                Get access to 9 premium message templates with seasonal variations,<br/>
                custom branding options, and advanced personalization features.
              </span>
            </Text>
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => alert("Pro plan upgrade coming soon!")}
                style={{
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  border: "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.5px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
                }}
              >
                Upgrade to Pro →
              </button>
              <button
                onClick={() => alert("Documentation coming soon!")}
                style={{
                  padding: "14px 32px",
                  background: "transparent",
                  border: "2px solid #d1d5db",
                  borderRadius: "12px",
                  color: "#4b5563",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  letterSpacing: "0.5px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#9ca3af";
                  e.currentTarget.style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Learn More
              </button>
            </div>
          </div>
          <div
            style={{
              width: "140px",
              height: "140px",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              borderRadius: "24px",
              marginLeft: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.2)",
              border: "2px solid rgba(245, 158, 11, 0.2)"
            }}
          >
            ⭐
          </div>
        </div>
      )}

      {/* Create Custom Template */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          padding: "40px",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          marginBottom: "32px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          <span style={{
            display: "block",
            marginBottom: "12px",
            fontSize: "22px",
            fontWeight: "700",
            color: "#1f2937",
            letterSpacing: "-0.5px"
          }}>
            🎨 Create Custom Template
          </span>
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          <span style={{
            display: "block",
            marginBottom: "28px",
            color: "#6b7280",
            fontSize: "15px",
            lineHeight: "1.6"
          }}>
            Need a specific message format? Create your own template with custom variables,<br/>
            dynamic placeholders, and personalized styling.
          </span>
        </Text>
        <button
          onClick={() => alert("Custom template creation coming soon!")}
          style={{
            padding: "14px 32px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "14px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            transition: "all 0.3s ease",
            letterSpacing: "0.5px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(102, 126, 234, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
        >
          + Create Custom Template
        </button>
      </div>

      {/* Feature Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "28px",
        position: "relative",
        zIndex: 1
      }}>
        {/* Dynamic Variables */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#1f2937"
            }}>
              Dynamic Variables
            </span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            <span style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              All templates support dynamic date calculations and timezone awareness
            </span>
          </Text>
        </div>

        {/* Multi-Language */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#1f2937"
            }}>
              Multi-Language
            </span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            <span style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              Translate templates into any language your store supports
            </span>
          </Text>
        </div>

        {/* Instant Preview */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#1f2937"
            }}>
              Instant Preview
            </span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            <span style={{
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6"
            }}>
              See exactly how your message will look before applying
            </span>
          </Text>
        </div>
      </div>
    </div>
  );
}
