import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I install ETAly?",
          a: "Click 'Add app' from the Shopify App Store, then follow the installation prompts. ETAly will be added to your store and you can start creating delivery rules immediately.",
        },
        {
          q: "Do I need coding skills to use ETAly?",
          a: "No! ETAly is completely no-code. Create your delivery rules in the admin panel, and the delivery dates will automatically appear on your store using theme app extensions.",
        },
        {
          q: "How long does setup take?",
          a: "Most merchants complete setup in under 5 minutes. Simply create a delivery rule for your country, add holidays if needed, and you're done!",
        },
      ],
    },
    {
      category: "Delivery Rules",
      questions: [
        {
          q: "How do delivery rules work?",
          a: "Delivery rules define how long it takes to deliver to specific countries or regions. Set minimum and maximum delivery days, processing time, and cutoff times. ETAly automatically calculates the delivery date based on these rules.",
        },
        {
          q: "Can I create rules for different countries?",
          a: "Yes! Pro and Advanced plans support unlimited countries. Create different rules for domestic and international shipping, or customize by region.",
        },
        {
          q: "What is a cutoff time?",
          a: "Cutoff time is the deadline for same-day order processing. Orders placed after this time will be processed the next business day. For example, with a 2 PM cutoff, orders at 3 PM start processing tomorrow.",
        },
        {
          q: "Can I exclude weekends and holidays?",
          a: "Absolutely! ETAly can automatically skip weekends and custom holidays when calculating delivery dates. Add your business holidays in the Holidays section.",
        },
      ],
    },
    {
      category: "Display & Customization",
      questions: [
        {
          q: "Where will delivery dates appear?",
          a: "Delivery dates can appear on product pages, cart page, and checkout. Each location can be customized separately in Cart & Checkout Settings.",
        },
        {
          q: "Can I customize the appearance?",
          a: "Yes! Choose from different message styles (info, success, warning), customize icons, and use message templates. Advanced users can add custom CSS.",
        },
        {
          q: "What if I have multiple products in cart with different delivery times?",
          a: "ETAly can show either the earliest or latest delivery date based on your Cart Settings. This ensures customers know when to expect their complete order.",
        },
      ],
    },
    {
      category: "Plans & Pricing",
      questions: [
        {
          q: "What's included in the Free plan?",
          a: "Free plan includes 1 delivery rule for 1 country, perfect for testing ETAly or small stores with simple shipping. Upgrade to Pro for unlimited rules and countries.",
        },
        {
          q: "What's the difference between Pro and Advanced?",
          a: "Both have unlimited delivery rules and all features. Advanced plan includes priority support with 1-hour response time vs 24-hour for Pro.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can cancel your subscription anytime from the Plans & Billing page. No long-term contracts or cancellation fees.",
        },
        {
          q: "Is there a trial period?",
          a: "Yes! Shopify offers a standard app trial period. You can test all Pro/Advanced features before being charged.",
        },
      ],
    },
    {
      category: "Technical",
      questions: [
        {
          q: "Does ETAly work with my theme?",
          a: "Yes! ETAly uses theme app extensions which work with all Shopify themes (Online Store 2.0). The blocks can be added through your theme editor.",
        },
        {
          q: "Will it slow down my store?",
          a: "No. ETAly is optimized for performance with lazy loading and caching. The delivery calculation happens asynchronously without blocking page load.",
        },
        {
          q: "Does it work internationally?",
          a: "Yes! ETAly supports all countries and automatically detects customer location. Create separate rules for different countries and regions.",
        },
        {
          q: "Is customer data secure?",
          a: "Absolutely. ETAly is GDPR compliant and doesn't store personal customer data. We only track anonymous analytics for delivery rule performance.",
        },
      ],
    },
    {
      category: "Support",
      questions: [
        {
          q: "How do I get support?",
          a: "Email us at support@etaly.app. Free plan: 48-72h response, Pro: 24h response, Advanced: 1h priority response.",
        },
        {
          q: "Can you help with custom carrier integrations?",
          a: "Yes! Advanced plan users can request custom carrier API integrations. Contact support@etaly.app for details.",
        },
        {
          q: "Do you offer setup assistance?",
          a: "Pro and Advanced plans include setup assistance via email. We'll help you configure your delivery rules and optimize your settings.",
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
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: "20px", color: "#6b7280" }}>
            Everything you need to know about ETAly
          </p>
        </div>

        {/* FAQ Categories */}
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "600", color: "#1f2937", marginBottom: "24px" }}>
              {category.category}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {category.questions.map((faq, faqIndex) => {
                const globalIndex = categoryIndex * 100 + faqIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <div
                    key={faqIndex}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "24px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1f2937", margin: 0 }}>
                        {faq.q}
                      </h3>
                      <span style={{ fontSize: "24px", color: "#6b7280", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        ▼
                      </span>
                    </div>
                    {isOpen && (
                      <p style={{ fontSize: "16px", color: "#6b7280", marginTop: "16px", lineHeight: "1.6", margin: "16px 0 0 0" }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{ marginTop: "60px", textAlign: "center", padding: "48px", background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", color: "#1f2937", marginBottom: "16px" }}>
            Still have questions?
          </h2>
          <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "32px" }}>
            Our support team is here to help
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
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
