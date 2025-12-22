export default function Changelog() {
  const releases = [
    {
      version: "1.0.0",
      date: "December 2024",
      type: "Major Release",
      changes: [
        {
          category: "New Features",
          items: [
            "Product page delivery ETA display with theme app extensions",
            "Cart page delivery date aggregation",
            "Checkout page delivery estimates",
            "Multi-country delivery rule support",
            "Holiday and weekend exclusion system",
            "Cutoff time configuration",
            "Customizable message templates",
            "Analytics dashboard with impressions and click tracking",
            "Three pricing tiers: Free, Pro ($19.99), Advanced ($49.99)",
          ],
        },
        {
          category: "Admin Features",
          items: [
            "Intuitive dashboard with quick stats",
            "Delivery rule management with priority system",
            "Multi-country selector with search",
            "Holiday calendar management",
            "Cart & Checkout settings configuration",
            "Message template library",
            "Real-time analytics and reporting",
          ],
        },
        {
          category: "Developer",
          items: [
            "Theme app extensions for Online Store 2.0",
            "Storefront API for ETA calculation",
            "GDPR-compliant data handling",
            "Session-based conversion tracking",
            "Optimized performance with lazy loading",
          ],
        },
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "60px 20px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h1 style={{ fontSize: "48px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Changelog
          </h1>
          <p style={{ fontSize: "20px", color: "#6b7280" }}>
            Track new features, improvements, and bug fixes
          </p>
        </div>

        {/* Subscribe to Updates */}
        <div style={{ marginBottom: "48px", background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                Stay updated
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: 0 }}>
                Get notified when we ship new features
              </p>
            </div>
            <a
              href="mailto:support@etaly.app?subject=Subscribe to Updates"
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              Subscribe
            </a>
          </div>
        </div>

        {/* Releases */}
        <div style={{ position: "relative" }}>
          {/* Timeline Line */}
          <div
            style={{
              position: "absolute",
              left: "23px",
              top: "40px",
              bottom: "0",
              width: "2px",
              background: "#e5e7eb",
            }}
          />

          {releases.map((release, releaseIndex) => (
            <div key={releaseIndex} style={{ marginBottom: "48px", position: "relative" }}>
              {/* Version Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", margin: 0 }}>
                      v{release.version}
                    </h2>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {release.type}
                    </span>
                  </div>
                  <p style={{ fontSize: "15px", color: "#6b7280", margin: "4px 0 0 0" }}>
                    Released {release.date}
                  </p>
                </div>
              </div>

              {/* Changes */}
              <div style={{ marginLeft: "64px" }}>
                {release.changes.map((changeGroup, groupIndex) => (
                  <div key={groupIndex} style={{ marginBottom: "32px" }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#1f2937",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {changeGroup.category === "New Features" && "✨"}
                      {changeGroup.category === "Improvements" && "🚀"}
                      {changeGroup.category === "Bug Fixes" && "🐛"}
                      {changeGroup.category === "Admin Features" && "⚙️"}
                      {changeGroup.category === "Developer" && "👨‍💻"}
                      {changeGroup.category}
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                      {changeGroup.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          style={{
                            padding: "12px 16px",
                            background: "white",
                            borderRadius: "8px",
                            fontSize: "15px",
                            color: "#4b5563",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <span style={{ color: "#10b981", fontSize: "16px", lineHeight: "1.5", flexShrink: 0 }}>•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap Teaser */}
        <div style={{ marginTop: "60px", background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            What's Coming Next?
          </h2>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px", maxWidth: "600px", margin: "0 auto 32px" }}>
            We're constantly working on new features. Here's what's on our roadmap:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginTop: "32px" }}>
            <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", textAlign: "left" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                🚚 Carrier API Integrations
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Direct integration with DHL, UPS, FedEx APIs for real-time tracking
              </p>
            </div>
            <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", textAlign: "left" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                🎨 Advanced Customization
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Custom CSS editor and more template options
              </p>
            </div>
            <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", textAlign: "left" }}>
              <h4 style={{ fontSize: "16px", fontWeight: "600", color: "#1f2937", marginBottom: "8px" }}>
                📧 Email Notifications
              </h4>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                Delivery date reminders in order confirmation emails
              </p>
            </div>
          </div>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "32px" }}>
            Have a feature request?{" "}
            <a href="mailto:support@etaly.app" style={{ color: "#2563eb", textDecoration: "none" }}>
              Let us know
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
