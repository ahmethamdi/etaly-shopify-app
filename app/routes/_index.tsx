import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";

/**
 * Root route - Modern landing page for ETAly
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  // If there's a shop parameter, this is an installation attempt
  if (url.searchParams.has("shop")) {
    try {
      await authenticate.admin(request);
      return redirect("/app");
    } catch (error) {
      throw error;
    }
  }

  return null;
};

export default function Index() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header / Navigation */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
      }}>
        <nav style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: "2.5" }}>
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
              </svg>
            </div>
            <span style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937" }}>ETAly</span>
          </div>

          {/* Navigation Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link to="/pricing" style={{ fontSize: "15px", fontWeight: "500", color: "#6b7280", textDecoration: "none" }}>
              Pricing
            </Link>
            <Link to="/documentation" style={{ fontSize: "15px", fontWeight: "500", color: "#6b7280", textDecoration: "none" }}>
              Documentation
            </Link>
            <Link to="/faq" style={{ fontSize: "15px", fontWeight: "500", color: "#6b7280", textDecoration: "none" }}>
              FAQ
            </Link>
            <Link to="/support" style={{ fontSize: "15px", fontWeight: "500", color: "#6b7280", textDecoration: "none" }}>
              Support
            </Link>
            <a
              href="/app"
              style={{
                padding: "10px 24px",
                background: "#2563eb",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: "600",
                transition: "all 0.2s"
              }}
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "80px 24px",
        textAlign: "center"
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          background: "#eff6ff",
          borderRadius: "100px",
          marginBottom: "24px"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            background: "#2563eb",
            borderRadius: "50%"
          }} />
          <span style={{ fontSize: "14px", fontWeight: "600", color: "#2563eb" }}>
            Trusted by 1,000+ Shopify stores
          </span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: "64px",
          fontWeight: "800",
          color: "#111827",
          marginBottom: "24px",
          lineHeight: "1.1",
          letterSpacing: "-0.02em"
        }}>
          Show Delivery Dates.<br />
          <span style={{
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Boost Conversions.
          </span>
        </h1>

        <p style={{
          fontSize: "20px",
          color: "#6b7280",
          marginBottom: "40px",
          lineHeight: "1.6",
          maxWidth: "700px",
          margin: "0 auto 40px"
        }}>
          Display accurate delivery estimates on product pages, cart, and checkout.
          Reduce support tickets and increase customer confidence.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "60px" }}>
          <a
            href="/app"
            style={{
              padding: "16px 40px",
              background: "#2563eb",
              color: "white",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              transition: "all 0.2s"
            }}
          >
            Install Free on Shopify
          </a>
          <Link
            to="/documentation"
            style={{
              padding: "16px 40px",
              background: "white",
              color: "#2563eb",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: "600",
              border: "2px solid #e5e7eb",
              display: "inline-block",
              transition: "all 0.2s"
            }}
          >
            View Documentation
          </Link>
        </div>

        {/* Screenshot/Demo */}
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "60px 40px",
            textAlign: "center",
            color: "white"
          }}>
            <div style={{ fontSize: "18px", marginBottom: "16px", opacity: 0.9 }}>
              Preview Coming Soon
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700" }}>
              ETAly Dashboard
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        background: "#f9fafb",
        padding: "100px 24px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{
              fontSize: "42px",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "16px"
            }}>
              Everything you need for delivery estimates
            </h2>
            <p style={{ fontSize: "18px", color: "#6b7280" }}>
              Powerful features to help your customers know exactly when their order arrives
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px"
          }}>
            {/* Feature Card 1 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#eff6ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Smart Cutoff Times
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Set cutoff times for same-day dispatch. Orders after cutoff automatically show next-day dispatch.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#f0fdf4",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#16a34a" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Holiday & Weekend Exclusion
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Automatically exclude weekends and holidays from delivery calculations. Add custom holidays per country.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#fef3c7",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#d97706" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Multi-Country Support
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Create different delivery rules for different countries. Support for 200+ countries worldwide.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#fce7f3",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#be185d" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Product-Specific Overrides
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Set custom delivery times for specific products. Perfect for pre-orders or made-to-order items.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#e0e7ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#4f46e5" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Customizable Messages
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Choose from 10+ pre-designed message templates or create your own custom messages.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                width: "56px",
                height: "56px",
                background: "#ecfdf5",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px"
              }}>
                <svg width="28" height="28" fill="none" stroke="#059669" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", marginBottom: "12px" }}>
                Analytics Dashboard
              </h3>
              <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6", margin: 0 }}>
                Track impressions, clicks, and conversion attribution. See which messages perform best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "100px 24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textAlign: "center",
        color: "white"
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "700", marginBottom: "20px" }}>
            Ready to boost your conversions?
          </h2>
          <p style={{ fontSize: "18px", marginBottom: "40px", opacity: 0.9 }}>
            Join thousands of Shopify stores using ETAly to increase customer confidence
          </p>
          <a
            href="/app"
            style={{
              padding: "18px 48px",
              background: "white",
              color: "#667eea",
              borderRadius: "12px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "600",
              display: "inline-block",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)"
            }}
          >
            Install Free on Shopify
          </a>
          <div style={{ marginTop: "24px", fontSize: "14px", opacity: 0.8 }}>
            No credit card required • 5-minute setup • Free plan available
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: "#111827",
        color: "#9ca3af",
        padding: "60px 24px 24px"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px"
          }}>
            {/* Column 1 */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  background: "#2563eb",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24" style={{ strokeWidth: "2.5" }}>
                    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/>
                  </svg>
                </div>
                <span style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>ETAly</span>
              </div>
              <p style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Show accurate delivery dates on your Shopify store and boost conversions.
              </p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Product
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/pricing" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Pricing
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/documentation" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Documentation
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/changelog" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Support */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Support
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/faq" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    FAQ
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/tutorial" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Tutorial
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/support" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Legal */}
            <div>
              <h4 style={{ fontSize: "14px", fontWeight: "600", color: "white", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Legal
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/privacy-policy" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Privacy Policy
                  </Link>
                </li>
                <li style={{ marginBottom: "12px" }}>
                  <Link to="/terms-of-service" style={{ fontSize: "14px", color: "#9ca3af", textDecoration: "none" }}>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: "1px solid #374151",
            paddingTop: "24px",
            textAlign: "center",
            fontSize: "14px"
          }}>
            © 2024 ETAly. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
