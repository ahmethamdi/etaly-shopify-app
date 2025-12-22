export default function Support() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "24px" }}>Support & Contact</h1>

      <p style={{ lineHeight: "1.6", color: "#6b7280", marginBottom: "32px" }}>
        Need help with ETAly? We're here to assist you. Choose the best way to reach us below.
      </p>

      {/* Contact Methods */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", marginBottom: "48px" }}>
        {/* Email Support */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>Email Support</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Get help via email</p>
            </div>
          </div>
          <p style={{ lineHeight: "1.6", color: "#374151", marginBottom: "16px" }}>
            Send us an email and we'll respond within 24 hours (usually much faster).
          </p>
          <a
            href="mailto:support@etaly.app"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            support@etaly.app
          </a>
        </div>

        {/* Documentation */}
        <div style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>Documentation</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Self-service guides</p>
            </div>
          </div>
          <p style={{ lineHeight: "1.6", color: "#374151", marginBottom: "16px" }}>
            Browse our comprehensive guides and tutorials to get the most out of ETAly.
          </p>
          <a
            href="https://docs.etaly.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "white",
              color: "#10b981",
              border: "1px solid #10b981",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            Visit Documentation
          </a>
        </div>
      </div>

      {/* FAQ Section */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Frequently Asked Questions</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* FAQ Item */}
          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>How do I install ETAly on my store?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              Simply install the app from the Shopify App Store, grant the necessary permissions, and configure your first delivery rule.
              The theme extension will automatically be available in your theme customizer.
            </p>
          </div>

          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Can I customize the delivery estimate styling?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              Yes! Pro and Advanced plans include custom CSS styling options. You can customize colors, fonts, spacing, and more
              to match your store's design.
            </p>
          </div>

          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>How do I cancel my subscription?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              You can cancel anytime by uninstalling the app from your Shopify admin. You'll have access until the end of your
              current billing period, and there are no cancellation fees.
            </p>
          </div>

          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Do you offer a free trial?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              Yes! We offer a 14-day free trial for both Pro and Advanced plans. No credit card required to start the trial.
            </p>
          </div>

          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>Can I use ETAly on multiple stores?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              The Advanced plan supports up to 3 stores. For Free and Pro plans, you'll need a separate subscription for each store.
            </p>
          </div>

          <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>How accurate are the delivery estimates?</h3>
            <p style={{ lineHeight: "1.6", color: "#6b7280", margin: "0" }}>
              Delivery estimates are based on the rules you configure. ETAly calculates dates using your specified delivery times,
              cutoff hours, holidays, and weekend settings. You're responsible for ensuring your rules match your actual shipping capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Response Times */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "24px" }}>Response Times</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div style={{ textAlign: "center", padding: "20px", background: "#f9fafb", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#6b7280", marginBottom: "8px" }}>Free</div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>48-72 hours</div>
          </div>

          <div style={{ textAlign: "center", padding: "20px", background: "#eff6ff", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2563eb", marginBottom: "8px" }}>Pro</div>
            <div style={{ fontSize: "14px", color: "#2563eb" }}>24 hours</div>
          </div>

          <div style={{ textAlign: "center", padding: "20px", background: "#fef3c7", borderRadius: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b", marginBottom: "8px" }}>Advanced</div>
            <div style={{ fontSize: "14px", color: "#f59e0b" }}>1 hour (priority)</div>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <div style={{ padding: "24px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Business Hours</h3>
        <p style={{ lineHeight: "1.6", color: "#374151", marginBottom: "12px" }}>
          Our support team is available:
        </p>
        <ul style={{ lineHeight: "1.8", color: "#374151", marginLeft: "24px", marginBottom: "0" }}>
          <li>Monday - Friday: 9:00 AM - 6:00 PM EST</li>
          <li>Saturday - Sunday: Limited support (email only)</li>
          <li>We respond to urgent issues 24/7 for Advanced plan customers</li>
        </ul>
      </div>
    </div>
  );
}
