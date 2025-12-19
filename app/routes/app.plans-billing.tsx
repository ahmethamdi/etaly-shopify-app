import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Icon } from "@shopify/polaris";
import { StarFilledIcon, StarIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  return {
    shop: session.shop,
  };
};

export default function PlansBilling() {
  const {} = useLoaderData<typeof loader>();

  const plans = [
    {
      id: "free",
      name: "Free",
      IconComponent: StarIcon,
      iconBg: "#f3f4f6",
      iconColor: "#6b7280",
      price: "€0",
      period: "forever",
      description: "Perfect for testing and small stores",
      buttonText: "Current Plan",
      buttonVariant: "secondary" as const,
      buttonDisabled: true,
      features: [
        { text: "1 delivery rule", included: true },
        { text: "1 country/region", included: true },
        { text: "Basic ETA messages", included: true },
        { text: "Product page display", included: true },
        { text: "Email support", included: true },
        { text: "Cart & checkout display", included: false },
        { text: "Holiday calendar", included: false },
        { text: "Analytics dashboard", included: false },
        { text: "Custom templates", included: false },
        { text: "Priority support", included: false },
      ],
      isMostPopular: false,
    },
    {
      id: "pro",
      name: "Pro",
      IconComponent: StarFilledIcon,
      iconBg: "#2563eb",
      iconColor: "#ffffff",
      price: "€19.99",
      period: "per month",
      description: "Everything you need for a professional store",
      buttonText: "Upgrade to Pro",
      buttonVariant: "primary" as const,
      buttonDisabled: false,
      features: [
        { text: "Unlimited delivery rules", included: true },
        { text: "Unlimited countries", included: true },
        { text: "Advanced ETA messages", included: true },
        { text: "All page placements", included: true },
        { text: "Holiday calendar & weekends", included: true },
        { text: "Cart & checkout display", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "Custom CSS styling", included: true },
        { text: "Email & chat support", included: true },
        { text: "Remove branding", included: false },
      ],
      isMostPopular: true,
    },
    {
      id: "advanced",
      name: "Advanced",
      icon: "",
      iconBg: "#f59e0b",
      iconColor: "#ffffff",
      price: "€49.99",
      period: "per month",
      description: "For high-volume stores and agencies",
      buttonText: "Upgrade to Advanced",
      buttonVariant: "secondary" as const,
      buttonDisabled: false,
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Variant-level ETA override", included: true },
        { text: "Multi-store support (3 stores)", included: true },
        { text: "Advanced analytics & A/B testing", included: true },
        { text: "Custom integrations", included: true },
        { text: "API access", included: true },
        { text: "White-label option", included: true },
        { text: "Priority support (1h response)", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom feature requests", included: true },
      ],
      isMostPopular: false,
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Plans & Billing
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          <span style={{ marginTop: "8px", display: "block" }}>
            Choose the plan that fits your store's needs
          </span>
        </Text>

        {/* Free Trial Banner */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#d1fae5",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <Text as="span" variant="bodySm" fontWeight="medium">
            <span style={{ color: "#10b981" }}>
              14-day free trial • No credit card required • Cancel anytime
            </span>
          </Text>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px 24px",
              border: plan.isMostPopular ? "2px solid #2563eb" : "1px solid #e5e7eb",
              position: "relative",
            }}
          >
            {/* Most Popular Badge */}
            {plan.isMostPopular && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#2563eb",
                  color: "white",
                  padding: "6px 20px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Most Popular
              </div>
            )}

            {/* Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: plan.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Icon source={plan.IconComponent || StarIcon} tone="base" />
            </div>

            {/* Plan Name */}
            <Text as="h2" variant="headingLg" fontWeight="bold">
              <span style={{ display: "block", marginBottom: "8px" }}>{plan.name}</span>
            </Text>

            {/* Description */}
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "20px" }}>{plan.description}</span>
            </Text>

            {/* Price */}
            <div style={{ marginBottom: "24px" }}>
              <Text as="h3" variant="heading2xl" fontWeight="bold">
                <span style={{ display: "inline-block" }}>{plan.price}</span>
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                {" "}
                {plan.period}
              </Text>
            </div>

            {/* Button */}
            <button
              disabled={plan.buttonDisabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: plan.buttonVariant === "primary" ? "none" : "1px solid #d1d5db",
                background: plan.buttonVariant === "primary" ? "#2563eb" : plan.buttonDisabled ? "#f3f4f6" : "white",
                color: plan.buttonVariant === "primary" ? "white" : plan.buttonDisabled ? "#9ca3af" : "#374151",
                fontSize: "14px",
                fontWeight: "600",
                cursor: plan.buttonDisabled ? "not-allowed" : "pointer",
                marginBottom: "24px",
              }}
            >
              {plan.buttonText}
            </button>

            {/* Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {plan.features.map((feature, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {feature.included ? (
                    <svg width="16" height="16" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" fill="none" stroke="#d1d5db" viewBox="0 0 24 24" style={{ strokeWidth: "2", flexShrink: 0 }}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  )}
                  <Text as="span" variant="bodySm">
                    <span style={{ color: feature.included ? "#374151" : "#9ca3af" }}>{feature.text}</span>
                  </Text>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "40px" }}>
        {/* 14-Day Free Trial */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>14-Day Free Trial</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Try Pro features risk-free with no credit card required
          </Text>
        </div>

        {/* Instant Activation */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Instant Activation</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            Upgrade or downgrade anytime with immediate effect
          </Text>
        </div>

        {/* Cancel Anytime */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="28" height="28" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <Text as="h3" variant="headingMd" fontWeight="semibold">
            <span style={{ display: "block", marginBottom: "8px" }}>Cancel Anytime</span>
          </Text>
          <Text as="p" variant="bodySm" tone="subdued">
            No long-term contracts. Cancel your subscription anytime.
          </Text>
        </div>
      </div>

      {/* Current Subscription */}
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
          <span style={{ display: "block", marginBottom: "24px" }}>Current Subscription</span>
        </Text>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          {/* Icon */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon source={StarFilledIcon} tone="base" />
          </div>

          {/* Plan Info */}
          <div style={{ flex: 1 }}>
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              Pro Plan
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              €19.99 per month • Renews on Jan 15, 2025
            </Text>
          </div>

          {/* Active Badge */}
          <div
            style={{
              padding: "6px 16px",
              background: "#d1fae5",
              borderRadius: "6px",
            }}
          >
            <Text as="span" variant="bodySm" fontWeight="semibold">
              <span style={{ color: "#10b981" }}>Active</span>
            </Text>
          </div>
        </div>

        {/* Payment & Email Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Payment Method */}
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "8px" }}>Payment Method</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>•••• •••• •••• 4242</span>
            </Text>
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Update payment method
            </a>
          </div>

          {/* Billing Email */}
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "8px" }}>Billing Email</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>store@example.com</span>
            </Text>
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Change billing email
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            View Invoices
          </button>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Shopify Billing Integration */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#374151" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <Text as="h3" variant="headingMd" fontWeight="semibold">
              <span style={{ display: "block", marginBottom: "8px" }}>Shopify Billing Integration</span>
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "12px" }}>
                All charges are processed through Shopify's secure billing system. You'll see "Delivery ETA App" on your Shopify invoice. No separate payment required.
              </span>
            </Text>
            <a
              href="#"
              style={{
                color: "#2563eb",
                fontSize: "14px",
                textDecoration: "none",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Learn more about Shopify billing
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
