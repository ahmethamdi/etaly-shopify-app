export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: "🚀",
      items: [
        {
          title: "Installation",
          content: "Install ETAly from the Shopify App Store with one click. No coding required.",
        },
        {
          title: "Quick Setup",
          content: "Create your first delivery rule in under 5 minutes. Select countries, set delivery days, and you're done.",
        },
        {
          title: "Theme Integration",
          content: "Add ETAly blocks to your theme using the theme editor. Works with all Online Store 2.0 themes.",
        },
      ],
    },
    {
      title: "Delivery Rules",
      icon: "📦",
      items: [
        {
          title: "Creating Rules",
          content: "Define delivery estimates for specific countries, regions, or postal codes. Set minimum and maximum delivery days, processing time, and cutoff times.",
        },
        {
          title: "Rule Priority",
          content: "When multiple rules match, ETAly uses the highest priority rule. Use priority to create specific rules for regions within a country.",
        },
        {
          title: "Cutoff Times",
          content: "Set daily order cutoff times. Orders placed after cutoff start processing the next business day.",
        },
        {
          title: "Multi-Country Support",
          content: "Create different rules for domestic and international shipping. Pro/Advanced plans support unlimited countries.",
        },
      ],
    },
    {
      title: "Holidays & Weekends",
      icon: "📅",
      items: [
        {
          title: "Excluding Weekends",
          content: "Enable 'Exclude Weekends' in your delivery rule to skip Saturdays and Sundays in calculations.",
        },
        {
          title: "Adding Holidays",
          content: "Add custom holidays to ensure accurate delivery dates. Holidays can be one-time or recurring annually.",
        },
        {
          title: "Country-Specific Holidays",
          content: "Set holidays for specific countries (e.g., US Thanksgiving) or globally (e.g., New Year's Day).",
        },
      ],
    },
    {
      title: "Display Settings",
      icon: "🎨",
      items: [
        {
          title: "Product Page",
          content: "Add the 'Product Delivery ETA' block to product templates. Customize icon, style (info/success/warning), and position.",
        },
        {
          title: "Cart Page",
          content: "Add the 'Cart Delivery ETA' block to cart template. Choose aggregation method (latest or earliest delivery date).",
        },
        {
          title: "Checkout",
          content: "Enable checkout ETA in Cart & Checkout Settings. Select position and style for checkout pages.",
        },
        {
          title: "Message Templates",
          content: "Use pre-built templates or create custom messages. Variables like {eta_min} and {eta_max} are automatically replaced.",
        },
      ],
    },
    {
      title: "Analytics",
      icon: "📊",
      items: [
        {
          title: "Impressions",
          content: "Track how many times delivery dates are shown to customers. Filter by date range, country, or delivery rule.",
        },
        {
          title: "Click Tracking",
          content: "See how many customers interact with delivery date messages. Use CTR to measure engagement.",
        },
        {
          title: "Conversion Tracking",
          content: "Monitor orders with ETAly session tracking to measure conversion impact.",
        },
      ],
    },
    {
      title: "Plans & Billing",
      icon: "💳",
      items: [
        {
          title: "Free Plan",
          content: "1 delivery rule, 1 country. Perfect for testing or simple stores. 48-72h support response.",
        },
        {
          title: "Pro Plan - $19.99/mo",
          content: "Unlimited delivery rules and countries. All features included. 24h support response.",
        },
        {
          title: "Advanced Plan - $49.99/mo",
          content: "Everything in Pro plus priority 1-hour support and setup assistance.",
        },
        {
          title: "Upgrading/Downgrading",
          content: "Change plans anytime from Plans & Billing. Prorated billing applies.",
        },
      ],
    },
    {
      title: "Technical Details",
      icon: "⚙️",
      items: [
        {
          title: "Theme App Extensions",
          content: "ETAly uses Shopify's theme app extension system. No theme file modifications needed. Clean uninstall guaranteed.",
        },
        {
          title: "Performance",
          content: "Delivery calculations happen asynchronously with lazy loading. Minimal impact on page load times.",
        },
        {
          title: "GDPR Compliance",
          content: "ETAly is GDPR compliant. We don't store personal customer data. Anonymous analytics only.",
        },
        {
          title: "Browser Support",
          content: "Works on all modern browsers (Chrome, Firefox, Safari, Edge). Mobile responsive.",
        },
      ],
    },
    {
      title: "Troubleshooting",
      icon: "🔧",
      items: [
        {
          title: "Delivery Dates Not Showing",
          content: "1. Verify theme blocks are added in theme editor. 2. Check delivery rules are active. 3. Confirm app is enabled in Settings.",
        },
        {
          title: "Wrong Delivery Date",
          content: "1. Check cutoff time settings. 2. Verify holidays are configured. 3. Ensure weekends are excluded if needed.",
        },
        {
          title: "Multiple Countries Not Working",
          content: "Multi-country support requires Pro or Advanced plan. Upgrade from Plans & Billing.",
        },
        {
          title: "Theme Block Not Available",
          content: "Theme app extensions require Online Store 2.0. Update your theme or contact theme developer.",
        },
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "60px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Documentation
          </h1>
          <p style={{ fontSize: "20px", color: "#6b7280" }}>
            Complete guide to using ETAly
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ marginBottom: "60px", background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "16px" }}>
            Quick Links
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {sections.map((section, index) => (
              <a
                key={index}
                href={`#${section.title.toLowerCase().replace(/ /g, "-")}`}
                style={{
                  padding: "12px 16px",
                  background: "#f9fafb",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "#1f2937",
                  fontSize: "15px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Documentation Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {sections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              id={section.title.toLowerCase().replace(/ /g, "-")}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1f2937",
                  marginBottom: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span>{section.icon}</span>
                {section.title}
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "12px" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Support CTA */}
        <div style={{ marginTop: "60px", textAlign: "center", padding: "48px", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Need More Help?
          </h2>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px" }}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="mailto:support@etaly.app"
              style={{
                padding: "16px 32px",
                background: "#2563eb",
                color: "white",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Contact Support
            </a>
            <a
              href="/faq"
              style={{
                padding: "16px 32px",
                background: "white",
                color: "#2563eb",
                border: "2px solid #2563eb",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              View FAQ
            </a>
            <a
              href="/tutorial"
              style={{
                padding: "16px 32px",
                background: "white",
                color: "#2563eb",
                border: "2px solid #2563eb",
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Setup Tutorial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
