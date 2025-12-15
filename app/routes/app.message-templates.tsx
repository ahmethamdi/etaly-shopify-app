import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const templates = [
    {
      id: "1",
      icon: "⚡",
      iconBg: "#d1fae5",
      iconColor: "#10b981",
      title: "Order Today, Delivered Tomorrow",
      subtitle: "Same-day or next-day delivery",
      message: "Order now – arrives tomorrow by 6 PM",
      messageBg: "#d1fae5",
      messageColor: "#10b981",
      isPro: false,
    },
    {
      id: "2",
      icon: "🚚",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      title: "Standard Delivery Range",
      subtitle: "Standard shipping",
      message: "Delivery in 2-3 business days",
      messageBg: "#dbeafe",
      messageColor: "#2563eb",
      isPro: false,
    },
    {
      id: "3",
      icon: "⏰",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      title: "Cutoff Time Warning",
      subtitle: "Urgency and cutoff times",
      message: "Order within 4h 23m for delivery by Thursday",
      messageBg: "#fef3c7",
      messageColor: "#f59e0b",
      isPro: false,
    },
    {
      id: "4",
      icon: "📦",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      title: "Ships Today Message",
      subtitle: "Same-day shipping",
      message: "Ships today if ordered before 16:00",
      messageBg: "#dbeafe",
      messageColor: "#2563eb",
      isPro: false,
    },
    {
      id: "5",
      icon: "🎁",
      iconBg: "#fecaca",
      iconColor: "#dc2626",
      title: "Holiday Shipping Notice",
      subtitle: "Holiday season",
      message: "Order by Dec 20 for Christmas delivery",
      messageBg: "#fecaca",
      messageColor: "#dc2626",
      isPro: true,
    },
    {
      id: "6",
      icon: "⏸️",
      iconBg: "#f3f4f6",
      iconColor: "#6b7280",
      title: "Weekend Delay Notice",
      subtitle: "Weekend awareness",
      message: "Weekend orders ship Monday",
      messageBg: "#f3f4f6",
      messageColor: "#6b7280",
      isPro: true,
    },
    {
      id: "7",
      icon: "🚚",
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      title: "International Shipping",
      subtitle: "Cross-border shipping",
      message: "International delivery: 5-10 business days",
      messageBg: "#dbeafe",
      messageColor: "#2563eb",
      isPro: true,
    },
    {
      id: "8",
      icon: "⚡",
      iconBg: "#fef3c7",
      iconColor: "#f59e0b",
      title: "Premium Fast Delivery",
      subtitle: "Premium shipping options",
      message: "⚡ Express delivery: Get it tomorrow",
      messageBg: "#fef3c7",
      messageColor: "#f59e0b",
      isPro: true,
    },
  ];

  return {
    shop: session.shop,
    templates,
  };
};

export default function MessageTemplates() {
  const { templates } = useLoaderData<typeof loader>();

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
        {templates.map((template) => (
          <div
            key={template.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              position: "relative",
            }}
          >
            {/* Pro Badge */}
            {template.isPro && (
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
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
                background: template.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                fontSize: "24px",
              }}
            >
              {template.icon}
            </div>

            {/* Title & Subtitle */}
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              <span style={{ display: "block", marginBottom: "4px" }}>{template.title}</span>
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "16px" }}>{template.subtitle}</span>
            </Text>

            {/* Message Preview */}
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                background: template.messageBg,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{template.icon}</span>
              <Text as="span" variant="bodySm" fontWeight="medium">
                <span style={{ color: template.messageColor }}>{template.message}</span>
              </Text>
            </div>

            {/* Button */}
            {template.isPro ? (
              <Button fullWidth disabled>
                Upgrade to Use
              </Button>
            ) : (
              <Button variant="primary" fullWidth>
                Use Template
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Unlock Pro Templates Banner */}
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
          }}
        />
      </div>

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
        <Button variant="primary">Create Custom Template</Button>
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
