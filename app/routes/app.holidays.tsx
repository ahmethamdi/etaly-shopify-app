import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Text, Button } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Mock holiday data
  const holidays = [
    {
      id: "1",
      name: "New Year's Day",
      date: "1 January 2025",
      type: "Public Holiday",
    },
    {
      id: "2",
      name: "Good Friday",
      date: "18 April 2025",
      type: "Public Holiday",
    },
    {
      id: "3",
      name: "Easter Monday",
      date: "21 April 2025",
      type: "Public Holiday",
    },
    {
      id: "4",
      name: "Labour Day",
      date: "1 May 2025",
      type: "Public Holiday",
    },
  ];

  return {
    shop: session.shop,
    holidays,
  };
};

export default function Holidays() {
  const { holidays } = useLoaderData<typeof loader>();

  // Calendar data for December 2025
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const calendarDays = [
    [null, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 31, null, null, null],
  ];

  const excludedDays = [6, 7, 13, 14, 20, 21, 26, 27, 28];

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Holidays & Weekends
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Configure which days should be excluded from delivery calculations
        </Text>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Left Column - Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* General Settings */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              General Settings
            </Text>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Exclude Weekends */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{
                    width: "20px",
                    height: "20px",
                    marginTop: "2px",
                    cursor: "pointer",
                    accentColor: "#2563eb",
                  }}
                />
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Exclude Weekends
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Saturdays and Sundays will not count as delivery days
                  </Text>
                </div>
              </div>

              {/* Skip Holidays Automatically */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{
                    width: "20px",
                    height: "20px",
                    marginTop: "2px",
                    cursor: "pointer",
                    accentColor: "#2563eb",
                  }}
                />
                <div>
                  <Text as="p" variant="bodyMd" fontWeight="medium">
                    Skip Holidays Automatically
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    Public holidays will be excluded from delivery calculations
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Holiday Calendar */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
            }}
          >
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Holiday Calendar
            </Text>

            {/* Country Selector */}
            <div style={{ marginTop: "20px" }}>
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Country
              </Text>
              <div style={{ marginTop: "8px", position: "relative" }}>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="#6b7280"
                  viewBox="0 0 24 24"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    strokeWidth: "2",
                  }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <select
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 40px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option>Germany</option>
                  <option>Austria</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                </select>
              </div>
              <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
                <span style={{ marginTop: "8px", display: "block" }}>
                  Public holidays will be loaded automatically
                </span>
              </Text>
            </div>

            {/* Custom Holiday Dates */}
            <div style={{ marginTop: "24px" }}>
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Custom Holiday Dates
              </Text>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="gg.aa.yyyy"
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <Button variant="primary">
                  <div style={{ fontSize: "18px", lineHeight: "1" }}>+</div>
                </Button>
              </div>
            </div>

            {/* Holiday List */}
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "0" }}>
              {holidays.map((holiday, index) => (
                <div
                  key={holiday.id}
                  style={{
                    padding: "16px 0",
                    borderBottom: index < holidays.length - 1 ? "1px solid #e5e7eb" : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <Text as="p" variant="bodyMd" fontWeight="medium">
                        {holiday.name}
                      </Text>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {holiday.date}
                        </Text>
                        <span
                          style={{
                            padding: "2px 8px",
                            background: "#f3f4f6",
                            borderRadius: "4px",
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          {holiday.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    style={{
                      padding: "8px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#6b7280",
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Calendar Preview */}
        <div>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              border: "1px solid #e5e7eb",
              position: "sticky",
              top: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                Calendar Preview
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                December 2025
              </Text>
            </div>

            {/* Calendar */}
            <div style={{ marginTop: "20px" }}>
              {/* Days of Week Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6b7280",
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              {calendarDays.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {week.map((day, dayIndex) => {
                    const isExcluded = day && excludedDays.includes(day);
                    return (
                      <div
                        key={dayIndex}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          background: isExcluded ? "#fecaca" : "transparent",
                          fontSize: "14px",
                          fontWeight: isExcluded ? "600" : "400",
                          color: isExcluded ? "#dc2626" : "#1f2937",
                        }}
                      >
                        {day || ""}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Legend
              </Text>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                      background: "white",
                      border: "2px solid #e5e7eb",
                    }}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    Available delivery days
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                      background: "#fecaca",
                    }}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    Excluded days (weekends/holidays)
                  </Text>
                </div>
              </div>
            </div>

            {/* Smart Date Calculation Info */}
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "#eff6ff",
                borderRadius: "8px",
                display: "flex",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Text as="span" variant="bodySm" fontWeight="bold">
                  <span style={{ color: "white" }}>i</span>
                </Text>
              </div>
              <div>
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  <span style={{ color: "#2563eb" }}>Smart Date Calculation</span>
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  <span style={{ marginTop: "4px", display: "block" }}>
                    Delivery dates will automatically skip highlighted days. If a delivery would fall
                    on an excluded day, it will move to the next available business day.
                  </span>
                </Text>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button>Cancel</Button>
            <Button variant="primary">Save Holiday Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
