import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const upgradedPlan = url.searchParams.get("upgraded");

  let store = await db.store.findUnique({
    where: { shop: session.shop },
  });

  if (upgradedPlan && ["pro", "advanced"].includes(upgradedPlan)) {
    try {
      if (store) {
        store = await db.store.update({
          where: { id: store.id },
          data: { plan: upgradedPlan },
        });
      }
    } catch (error) {
      console.error("Failed to update plan after billing confirmation:", error);
    }
  }

  const currentPlan = store?.plan || "free";

  return json({
    shop: session.shop,
    currentPlan,
    upgraded: upgradedPlan ? true : false,
  });
};

export default function PlansBilling() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") return;
    setIsUpgrading(true);
    setUpgradingPlan(planId);
    try {
      const formData = new FormData();
      formData.append("plan", planId);
      const response = await fetch("/api/billing/subscribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        alert(data.error || "Failed to upgrade. Please try again.");
        return;
      }
      if (data.confirmationUrl) {
        window.top!.location.href = data.confirmationUrl;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("Failed to upgrade. Please try again.");
    } finally {
      setIsUpgrading(false);
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      emoji: "🌱",
      price: "$0",
      period: "forever",
      description: "Perfect for testing & small stores",
      color: "#6b7280",
      bgGradient: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      borderColor: "#e5e7eb",
      buttonStyle: "secondary",
      features: [
        { text: "1 delivery rule", included: true },
        { text: "1 country / region", included: true },
        { text: "Basic ETA messages", included: true },
        { text: "Product page ETA display", included: true },
        { text: "Email support", included: true },
        { text: "Cart & checkout ETA", included: false },
        { text: "Holiday calendar & weekends", included: false },
        { text: "Analytics dashboard", included: false },
        { text: "Product / collection targeting", included: false },
        { text: "Custom templates", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      emoji: "⚡",
      price: "$19.99",
      period: "per month",
      description: "The real sales-driving plan",
      color: "#2563eb",
      bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      borderColor: "#2563eb",
      buttonStyle: "primary",
      isMostPopular: true,
      features: [
        { text: "Unlimited delivery rules", included: true },
        { text: "Unlimited countries", included: true },
        { text: "Advanced ETA messages", included: true },
        { text: "Product / Collection / Tag targeting", included: true },
        { text: "Cart & Checkout ETA display", included: true },
        { text: "Holiday calendar & weekends logic", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "All page placements", included: true },
        { text: "Custom CSS styling", included: true },
        { text: "Email & chat support", included: true },
      ],
    },
    {
      id: "advanced",
      name: "Advanced",
      emoji: "👑",
      price: "$49.99",
      period: "per month",
      description: "Agency & High-Volume Stores",
      color: "#d97706",
      bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      borderColor: "#f59e0b",
      buttonStyle: "gold",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Variant-level ETA override", included: true },
        { text: "Multi-store support (up to 3 stores)", included: true },
        { text: "Advanced analytics & A/B testing", included: true },
        { text: "API access", included: true },
        { text: "White-label option (remove branding)", included: true },
        { text: "Priority support (1h response target)", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom feature requests", included: true },
      ],
    },
  ];

  const getButtonText = (plan: typeof plans[0]) => {
    if (isUpgrading && upgradingPlan === plan.id) return "Processing...";
    if (currentPlan === plan.id) return "Current Plan";
    if (plan.id === "free") return "Downgrade to Free";
    return `Upgrade to ${plan.name}`;
  };

  const getButtonStyles = (plan: typeof plans[0]): React.CSSProperties => {
    const isCurrentPlan = currentPlan === plan.id;
    const isLoading = isUpgrading && upgradingPlan === plan.id;

    if (isCurrentPlan) {
      return {
        width: "100%", padding: "13px", borderRadius: "10px",
        border: "1.5px solid #e5e7eb", background: "#f9fafb",
        color: "#9ca3af", fontSize: "14px", fontWeight: "600",
        cursor: "not-allowed", marginBottom: "28px",
      };
    }
    if (plan.buttonStyle === "primary") {
      return {
        width: "100%", padding: "13px", borderRadius: "10px",
        border: "none", background: isLoading ? "#93c5fd" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "white", fontSize: "14px", fontWeight: "700",
        cursor: isLoading ? "wait" : "pointer", marginBottom: "28px",
        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
        transition: "all 0.2s",
      };
    }
    if (plan.buttonStyle === "gold") {
      return {
        width: "100%", padding: "13px", borderRadius: "10px",
        border: "none", background: isLoading ? "#fcd34d" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        color: "white", fontSize: "14px", fontWeight: "700",
        cursor: isLoading ? "wait" : "pointer", marginBottom: "28px",
        boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
        transition: "all 0.2s",
      };
    }
    return {
      width: "100%", padding: "13px", borderRadius: "10px",
      border: "1.5px solid #d1d5db", background: "white",
      color: "#374151", fontSize: "14px", fontWeight: "600",
      cursor: "pointer", marginBottom: "28px",
      transition: "all 0.2s",
    };
  };

  return (
    <div style={{ padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
          border: "1px solid #bfdbfe", borderRadius: "100px",
          padding: "6px 16px", marginBottom: "16px",
        }}>
          <span style={{ fontSize: "14px" }}>✨</span>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "#2563eb" }}>Simple, transparent pricing</span>
        </div>
        <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", margin: "0 0 10px", letterSpacing: "-0.5px" }}>
          Plans & Billing
        </h1>
        <p style={{ fontSize: "16px", color: "#64748b", margin: "0 0 20px" }}>
          Choose the plan that fits your store's needs
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "20px",
          background: "white", border: "1px solid #e2e8f0",
          borderRadius: "12px", padding: "10px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          {[
            { icon: "✅", text: "14-day free trial" },
            { icon: "💳", text: "No credit card required" },
            { icon: "🔄", text: "Cancel anytime" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>{item.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "#374151" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px", maxWidth: "1100px", margin: "0 auto 32px" }}>
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          return (
            <div key={plan.id} style={{
              background: "white",
              borderRadius: "20px",
              padding: "0",
              border: plan.isMostPopular ? "2px solid #2563eb" : isCurrent && plan.id !== "free" ? `2px solid ${plan.color}` : "1.5px solid #e2e8f0",
              position: "relative",
              overflow: "hidden",
              boxShadow: plan.isMostPopular ? "0 8px 32px rgba(37, 99, 235, 0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
              transform: plan.isMostPopular ? "scale(1.02)" : "scale(1)",
              transition: "all 0.2s",
            }}>
              {/* Most Popular Badge */}
              {plan.isMostPopular && (
                <div style={{
                  position: "absolute", top: "0", left: "50%",
                  transform: "translate(-50%, 0)",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "white", padding: "6px 20px",
                  borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px",
                  fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px",
                  display: "flex", alignItems: "center", gap: "5px",
                }}>
                  ⭐ Most Popular
                </div>
              )}

              {/* Card Header */}
              <div style={{
                background: plan.bgGradient,
                padding: plan.isMostPopular ? "44px 28px 24px" : "28px 28px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: "white", display: "flex", alignItems: "center",
                  justifyContent: "center", marginBottom: "16px", fontSize: "26px",
                  boxShadow: `0 4px 12px ${plan.color}25`,
                  border: `1.5px solid ${plan.color}20`,
                }}>
                  {plan.emoji}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{plan.name}</h2>
                  {isCurrent && (
                    <span style={{
                      fontSize: "11px", fontWeight: "700", color: "white",
                      background: plan.color, padding: "3px 10px",
                      borderRadius: "100px", letterSpacing: "0.5px",
                    }}>ACTIVE</span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>{plan.description}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                  <span style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", letterSpacing: "-1px" }}>{plan.price}</span>
                  <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "500" }}>/{plan.period}</span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: "24px 28px" }}>
                <button
                  disabled={isCurrent || isUpgrading}
                  onClick={() => handleUpgrade(plan.id)}
                  style={getButtonStyles(plan)}
                >
                  {getButtonText(plan)}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {plan.features.map((feature, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                        background: feature.included ? "#d1fae5" : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {feature.included ? (
                          <svg width="11" height="11" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "3" }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ strokeWidth: "3" }}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: "13.5px", color: feature.included ? "#1e293b" : "#94a3b8", fontWeight: feature.included ? "500" : "400" }}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits */}
      <div style={{ maxWidth: "1100px", margin: "0 auto 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        {[
          { emoji: "🛡️", title: "14-Day Free Trial", desc: "Try Pro features risk-free with no credit card required", bg: "#eff6ff", border: "#dbeafe" },
          { emoji: "⚡", title: "Instant Activation", desc: "Upgrade or downgrade anytime with immediate effect", bg: "#f0fdf4", border: "#bbf7d0" },
          { emoji: "🔄", title: "Cancel Anytime", desc: "No long-term contracts. Cancel your subscription anytime.", bg: "#fffbeb", border: "#fde68a" },
        ].map((item, i) => (
          <div key={i} style={{
            background: item.bg, border: `1px solid ${item.border}`,
            borderRadius: "16px", padding: "20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "10px" }}>{item.emoji}</div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginBottom: "6px" }}>{item.title}</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Shopify Billing Note */}
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        background: "white", borderRadius: "16px",
        padding: "20px 24px", border: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "12px",
          background: "#f1f5f9", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, fontSize: "22px",
        }}>🛒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>Shopify Billing Integration</div>
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            All charges are processed through Shopify's secure billing system. You'll see "ETAly App" on your Shopify invoice.
          </div>
        </div>
        <a
          href="https://help.shopify.com/en/manual/your-account/manage-billing"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "13px", color: "#2563eb", fontWeight: "600",
            textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
            whiteSpace: "nowrap",
          }}
        >
          Learn more →
        </a>
      </div>
    </div>
  );
}
