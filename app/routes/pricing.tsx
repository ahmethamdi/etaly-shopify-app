export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for testing or small stores",
      features: [
        { text: "1 delivery rule", included: true },
        { text: "1 country / region", included: true },
        { text: "Product page ETA", included: true },
        { text: "Basic styling options", included: true },
        { text: "Email support (48-72h)", included: true },
        { text: "Unlimited countries", included: false },
        { text: "Cart & Checkout ETA", included: false },
        { text: "Analytics dashboard", included: false },
        { text: "Message templates", included: false },
        { text: "Priority support", included: false },
      ],
      cta: "Start Free",
      ctaLink: "https://apps.shopify.com/etaly",
      popular: false,
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "per month",
      description: "For growing businesses",
      features: [
        { text: "Unlimited delivery rules", included: true },
        { text: "Unlimited countries", included: true },
        { text: "Product, Cart & Checkout ETA", included: true },
        { text: "Advanced styling & customization", included: true },
        { text: "Message templates library", included: true },
        { text: "Analytics dashboard", included: true },
        { text: "Holiday management", included: true },
        { text: "Cutoff time configuration", included: true },
        { text: "Email support (24h response)", included: true },
        { text: "Setup assistance", included: false },
      ],
      cta: "Start Free Trial",
      ctaLink: "https://apps.shopify.com/etaly",
      popular: true,
    },
    {
      name: "Advanced",
      price: "$49.99",
      period: "per month",
      description: "For agencies & high-volume stores",
      features: [
        { text: "Everything in Pro", included: true },
        { text: "Priority support (1h response)", included: true },
        { text: "Dedicated setup assistance", included: true },
        { text: "Custom carrier integrations", included: true },
        { text: "Advanced analytics & reporting", included: true },
        { text: "White-label options (coming soon)", included: true },
        { text: "API access (coming soon)", included: true },
      ],
      cta: "Start Free Trial",
      ctaLink: "https://apps.shopify.com/etaly",
      popular: false,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "80px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "56px", fontWeight: "700", color: "white", marginBottom: "16px" }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: "22px", color: "rgba(255,255,255,0.9)", marginBottom: "32px" }}>
            Choose the plan that fits your business. No hidden fees.
          </p>
          <div
            style={{
              display: "inline-flex",
              gap: "8px",
              padding: "6px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "12px",
            }}
          >
            <span
              style={{
                padding: "8px 20px",
                background: "white",
                color: "#667eea",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              Monthly
            </span>
            <span
              style={{
                padding: "8px 20px",
                color: "white",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                opacity: 0.7,
              }}
            >
              Annual (Save 20%)
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "32px", marginBottom: "60px" }}>
          {plans.map((plan, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "40px",
                position: "relative",
                boxShadow: plan.popular ? "0 20px 60px rgba(0,0,0,0.3)" : "0 10px 40px rgba(0,0,0,0.1)",
                transform: plan.popular ? "scale(1.05)" : "scale(1)",
                transition: "all 0.3s",
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: "-16px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    padding: "8px 24px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "14px",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  ⭐ MOST POPULAR
                </div>
              )}

              {/* Plan Header */}
              <div style={{ textAlign: "center", marginBottom: "32px", marginTop: plan.popular ? "16px" : "0" }}>
                <h3 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "24px" }}>
                  {plan.description}
                </p>
                <div style={{ marginBottom: "8px" }}>
                  <span style={{ fontSize: "56px", fontWeight: "800", color: "#1f2937" }}>
                    {plan.price}
                  </span>
                </div>
                <p style={{ fontSize: "15px", color: "#6b7280" }}>
                  {plan.period}
                </p>
              </div>

              {/* CTA Button */}
              <a
                href={plan.ctaLink}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "16px",
                  background: plan.popular ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f3f4f6",
                  color: plan.popular ? "white" : "#1f2937",
                  borderRadius: "12px",
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "32px",
                  transition: "all 0.2s",
                  border: "none",
                }}
              >
                {plan.cta}
              </a>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 0",
                    }}
                  >
                    {feature.included ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" fill="#10b981" />
                        <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10" fill="#e5e7eb" />
                        <path d="M8 12h8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    <span
                      style={{
                        fontSize: "15px",
                        color: feature.included ? "#1f2937" : "#9ca3af",
                        fontWeight: feature.included ? "500" : "400",
                      }}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "24px", padding: "60px 40px", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: "48px" }}>
            Frequently Asked Questions
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "40px", maxWidth: "1000px", margin: "0 auto" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                Can I change plans anytime?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Yes! Upgrade or downgrade anytime from your dashboard. Changes are prorated automatically.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                Is there a free trial?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Yes! Shopify offers a standard trial period for all paid plans. Test all features before being charged.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                What payment methods do you accept?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                All payments are processed through Shopify. We accept all major credit cards and PayPal.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                Do you offer refunds?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Yes! If you're not satisfied within the first 30 days, contact us for a full refund.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                Can I use ETAly on multiple stores?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Each store requires a separate subscription. Contact us for volume discounts on 3+ stores.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                What happens if I cancel?
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                You can cancel anytime. Your data is kept for 30 days, then permanently deleted per GDPR.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: "24px", padding: "60px 40px", marginBottom: "60px", overflowX: "auto" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "700", color: "#1f2937", textAlign: "center", marginBottom: "48px" }}>
            Compare Plans
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "16px", textAlign: "left", fontSize: "16px", fontWeight: "600", color: "#6b7280" }}>
                  Feature
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                  Free
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: "#1f2937", background: "#f3f4f6" }}>
                  Pro
                </th>
                <th style={{ padding: "16px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: "#1f2937" }}>
                  Advanced
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Delivery Rules", free: "1", pro: "Unlimited", advanced: "Unlimited" },
                { feature: "Countries", free: "1", pro: "Unlimited", advanced: "Unlimited" },
                { feature: "Product Page ETA", free: "✓", pro: "✓", advanced: "✓" },
                { feature: "Cart & Checkout ETA", free: "✗", pro: "✓", advanced: "✓" },
                { feature: "Analytics", free: "✗", pro: "✓", advanced: "✓" },
                { feature: "Message Templates", free: "✗", pro: "✓", advanced: "✓" },
                { feature: "Support Response", free: "48-72h", pro: "24h", advanced: "1h" },
                { feature: "Setup Assistance", free: "✗", pro: "✗", advanced: "✓" },
                { feature: "Custom Integrations", free: "✗", pro: "✗", advanced: "✓" },
              ].map((row, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "16px", fontSize: "15px", color: "#1f2937" }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: "15px", color: "#6b7280" }}>
                    {row.free}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: "15px", color: "#1f2937", background: "#f9fafb", fontWeight: "500" }}>
                    {row.pro}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", fontSize: "15px", color: "#6b7280" }}>
                    {row.advanced}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Section */}
        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.95)", borderRadius: "24px", padding: "60px 40px" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Ready to boost your conversions?
          </h2>
          <p style={{ fontSize: "20px", color: "#6b7280", marginBottom: "40px" }}>
            Join thousands of merchants showing delivery dates to increase sales
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://apps.shopify.com/etaly"
              style={{
                padding: "18px 40px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "18px",
                fontWeight: "700",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              Start Free Trial
            </a>
            <a
              href="/tutorial"
              style={{
                padding: "18px 40px",
                background: "white",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "18px",
                fontWeight: "700",
              }}
            >
              View Tutorial
            </a>
          </div>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "24px" }}>
            No credit card required • Free plan available • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
