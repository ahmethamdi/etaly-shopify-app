import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Root route - Handles initial app installation and redirects
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // If there's a shop parameter, this is an installation attempt
  if (url.searchParams.has("shop")) {
    try {
      await authenticate.admin(request);
      // If authenticated, redirect to app
      return redirect("/app");
    } catch (error) {
      // Not authenticated, let Shopify handle OAuth
      throw error;
    }
  }

  // No shop parameter - show welcome page for direct visitors
  return null;
};

export default function Index() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        maxWidth: "800px",
        width: "100%",
        background: "#f5f7fa",
        borderRadius: "24px",
        padding: "48px",
        textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{
          width: "96px",
          height: "96px",
          background: "#2563eb",
          borderRadius: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 32px",
          boxShadow: "0 10px 40px rgba(37, 99, 235, 0.3)"
        }}>
          <svg width="56" height="56" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "16px",
          lineHeight: "1.2"
        }}>
          Your customers now know exactly when their order arrives.
        </h1>

        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          marginBottom: "48px",
          lineHeight: "1.6"
        }}>
          Show accurate delivery dates on product, cart and checkout pages.
        </p>

        {/* Progress Bar */}
        <div style={{
          height: "4px",
          background: "#e5e7eb",
          borderRadius: "4px",
          marginBottom: "48px",
          overflow: "hidden"
        }}>
          <div style={{
            width: "33.33%",
            height: "100%",
            background: "#2563eb",
            borderRadius: "4px"
          }} />
        </div>

        {/* Features */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          marginBottom: "48px",
          textAlign: "left"
        }}>
          {/* Feature 1 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "#eff6ff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                Increase conversion rates
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: "0", lineHeight: "1.5" }}>
                Customers buy more when they know exactly when their order arrives
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "#eff6ff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                Smart date calculations
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: "0", lineHeight: "1.5" }}>
                Automatically excludes weekends, holidays, and respects cutoff times
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              background: "#eff6ff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <svg width="24" height="24" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", marginBottom: "4px" }}>
                Works worldwide
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", margin: "0", lineHeight: "1.5" }}>
                Support for DHL, DPD, UPS, and custom carriers across all countries
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <a
            href="/app"
            style={{
              display: "block",
              width: "100%",
              padding: "16px 32px",
              background: "#2563eb",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Start Setup
          </a>

          <a
            href="https://demo.etaly.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "16px 32px",
              background: "white",
              color: "#2563eb",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              border: "2px solid #2563eb",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            View Demo Store Preview
          </a>
        </div>

        {/* Footer Note */}
        <p style={{
          marginTop: "32px",
          fontSize: "14px",
          color: "#9ca3af",
          margin: "32px 0 0"
        }}>
          Setup takes less than 5 minutes • No coding required
        </p>
      </div>
    </div>
  );
}
