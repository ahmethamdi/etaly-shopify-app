export default function Tutorial() {
  const steps = [
    {
      title: "1. Install ETAly",
      description: "Add ETAly to your Shopify store from the App Store",
      details: [
        "Visit the Shopify App Store",
        "Search for 'ETAly'",
        "Click 'Add app'",
        "Authorize the app permissions",
        "You'll be redirected to the ETAly dashboard",
      ],
    },
    {
      title: "2. Create Your First Delivery Rule",
      description: "Set up delivery estimates for your primary market",
      details: [
        "Go to 'Delivery Rules' in the sidebar",
        "Click 'Create Delivery Rule'",
        "Give it a name (e.g., 'US Standard Shipping')",
        "Select your country/countries",
        "Set minimum delivery days (e.g., 3)",
        "Set maximum delivery days (e.g., 5)",
        "Add processing days if needed (e.g., 1)",
        "Set a cutoff time (e.g., 2:00 PM)",
        "Click 'Save'",
      ],
    },
    {
      title: "3. Configure Weekends & Holidays",
      description: "Ensure accurate calculations by excluding non-working days",
      details: [
        "Toggle 'Exclude Weekends' in your delivery rule",
        "Go to 'Holidays' in the sidebar",
        "Click 'Add Holiday'",
        "Enter holiday name and date",
        "Select country (or leave blank for all)",
        "Enable 'Recurring' for annual holidays",
        "Click 'Save'",
      ],
    },
    {
      title: "4. Add Theme Blocks",
      description: "Display delivery dates on your storefront",
      details: [
        "Go to your Shopify admin",
        "Navigate to 'Online Store' → 'Themes'",
        "Click 'Customize' on your active theme",
        "Open a product page",
        "Click 'Add block' in the product section",
        "Find 'ETAly - Product Delivery ETA'",
        "Position it where you want (near Add to Cart)",
        "Customize the style and icon",
        "Repeat for Cart page (add 'Cart Delivery ETA' block)",
        "Click 'Save'",
      ],
    },
    {
      title: "5. Customize Appearance",
      description: "Match ETAly to your brand",
      details: [
        "In theme editor, select the ETAly block",
        "Choose message style: Info (blue), Success (green), or Warning (orange)",
        "Toggle icon visibility",
        "Change the icon emoji if desired",
        "Preview on different devices",
        "Adjust positioning as needed",
      ],
    },
    {
      title: "6. Configure Cart & Checkout Settings",
      description: "Optimize how delivery dates appear during checkout",
      details: [
        "Go to 'Cart & Checkout' in ETAly dashboard",
        "Enable/disable cart page ETA",
        "Choose aggregation method (latest or earliest delivery)",
        "Select cart position",
        "Enable/disable checkout ETA",
        "Choose checkout position",
        "Select message style for each",
        "Click 'Save Settings'",
      ],
    },
    {
      title: "7. Test Everything",
      description: "Verify delivery dates are calculating correctly",
      details: [
        "Visit your store (not in theme editor)",
        "Open a product page",
        "Verify delivery date appears",
        "Add product to cart",
        "Check cart page for delivery estimate",
        "Proceed to checkout",
        "Confirm delivery date displays",
        "Try with different countries (use VPN or browser location)",
        "Test cutoff time behavior",
      ],
    },
    {
      title: "8. Monitor Analytics",
      description: "Track performance and conversion impact",
      details: [
        "Go to 'Analytics' in ETAly dashboard",
        "Review total impressions (how many times delivery dates were shown)",
        "Check click-through rate",
        "Monitor conversion impact",
        "Filter by date range",
        "Analyze performance by country or delivery rule",
        "Use insights to optimize your delivery rules",
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "60px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            ETAly Setup Tutorial
          </h1>
          <p style={{ fontSize: "20px", color: "#6b7280" }}>
            Complete guide to setting up delivery date estimates on your store
          </p>
        </div>

        {/* Video Placeholder */}
        <div style={{ marginBottom: "60px", background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ background: "#e5e7eb", borderRadius: "12px", padding: "120px 40px", marginBottom: "24px" }}>
            <svg width="80" height="80" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "1.5", margin: "0 auto" }}>
              <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: "18px", color: "#6b7280", marginTop: "24px" }}>
              Video tutorial coming soon
            </p>
          </div>
          <p style={{ fontSize: "16px", color: "#6b7280" }}>
            For now, follow the step-by-step guide below
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {steps.map((step, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
                {/* Step Number */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "700",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
                    {step.title}
                  </h2>
                  <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "20px" }}>
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          fontSize: "15px",
                          color: "#4b5563",
                        }}
                      >
                        <span style={{ color: "#10b981", fontSize: "20px", lineHeight: "1" }}>✓</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help CTA */}
        <div style={{ marginTop: "60px", textAlign: "center", padding: "48px", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Need help with setup?
          </h2>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px" }}>
            Our support team can guide you through the process
          </p>
          <a
            href="mailto:support@etaly.app"
            style={{
              display: "inline-block",
              padding: "16px 32px",
              background: "#2563eb",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Get Setup Help
          </a>
        </div>
      </div>
    </div>
  );
}
