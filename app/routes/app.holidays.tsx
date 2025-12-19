import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Text, Button, Modal, TextField, Banner } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { useState, useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Find store
  const store = await db.store.findUnique({
    where: { shop },
  });

  if (!store) {
    return json({ shop, holidays: [] });
  }

  // Fetch holidays from database
  const holidays = await db.holiday.findMany({
    where: { storeId: store.id },
    orderBy: { date: "asc" },
  });

  // Format holidays for display
  const formattedHolidays = holidays.map((h) => {
    // Check if it's a preset holiday (contains country name in parentheses)
    const isPreset = /\([A-Za-z\s]+\)$/.test(h.name);
    return {
      id: h.id,
      name: h.name,
      date: new Date(h.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      rawDate: h.date.toISOString(),
      type: isPreset ? "Preset Holiday" : "Custom Holiday",
      isPreset,
    };
  });

  return json({
    shop: session.shop,
    holidays: formattedHolidays,
    excludeWeekends: store.excludeWeekends ?? true,
    skipHolidays: store.skipHolidays ?? true,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Find store
  const store = await db.store.findUnique({
    where: { shop },
  });

  if (!store) {
    return json({ success: false, error: "Store not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const actionType = formData.get("action") as string;

  // DELETE
  if (actionType === "delete") {
    const holidayId = formData.get("holidayId") as string;
    await db.holiday.delete({
      where: { id: holidayId },
    });
    return json({ success: true, message: "Holiday deleted successfully" });
  }

  // CREATE
  if (actionType === "create") {
    const name = formData.get("name") as string;
    const dateStr = formData.get("date") as string;

    if (!name || !dateStr) {
      return json({ success: false, error: "Name and date are required" }, { status: 400 });
    }

    // Parse date (expecting yyyy-mm-dd format from HTML5 date input)
    const date = new Date(dateStr);

    await db.holiday.create({
      data: {
        storeId: store.id,
        name,
        date,
        isRecurring: false,
      },
    });

    return json({ success: true, message: "Holiday added successfully" });
  }

  // UPDATE SETTINGS
  if (actionType === "updateSettings") {
    const excludeWeekends = formData.get("excludeWeekends") === "true";
    const skipHolidays = formData.get("skipHolidays") === "true";

    await db.store.update({
      where: { id: store.id },
      data: {
        excludeWeekends,
        skipHolidays,
      },
    });

    return json({ success: true, message: "Settings saved successfully" });
  }

  return json({ success: false, error: "Invalid action" }, { status: 400 });
};

export default function Holidays() {
  const loaderData = useLoaderData<typeof loader>();
  const { holidays, excludeWeekends: initialExcludeWeekends, skipHolidays: initialSkipHolidays } = loaderData;
  const fetcher = useFetcher();
  const [customDate, setCustomDate] = useState("");
  const [customName, setCustomName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteHolidayId, setDeleteHolidayId] = useState<string | null>(null);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Current month navigation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Settings state
  const [excludeWeekends, setExcludeWeekends] = useState(initialExcludeWeekends);
  const [skipHolidays, setSkipHolidays] = useState(initialSkipHolidays);
  const [selectedCountry, setSelectedCountry] = useState("DE");

  // Update settings state when loader data changes
  useEffect(() => {
    setExcludeWeekends(initialExcludeWeekends);
    setSkipHolidays(initialSkipHolidays);
  }, [initialExcludeWeekends, initialSkipHolidays]);

  // Handlers
  const handleDeleteClick = (holidayId: string) => {
    setDeleteHolidayId(holidayId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteHolidayId) {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("holidayId", deleteHolidayId);
      fetcher.submit(formData, { method: "post" });
      setShowDeleteModal(false);
      setDeleteHolidayId(null);
    }
  };

  const handleAdd = () => {
    if (!customName || !customDate) {
      setErrorMessage("Please enter both name and date");
      setShowErrorBanner(true);
      setTimeout(() => setShowErrorBanner(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("action", "create");
    formData.append("name", customName);
    formData.append("date", customDate);
    fetcher.submit(formData, { method: "post" });

    // Clear inputs
    setCustomName("");
    setCustomDate("");
  };

  const handleSaveSettings = () => {
    const formData = new FormData();
    formData.append("action", "updateSettings");
    formData.append("excludeWeekends", String(excludeWeekends));
    formData.append("skipHolidays", String(skipHolidays));
    fetcher.submit(formData, { method: "post" });
  };

  // Calendar generation
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const generateCalendar = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let currentWeek: (number | null)[] = new Array(firstDay).fill(null);

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Fill last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const calendarDays = generateCalendar(currentMonth, currentYear);

  // Get excluded days based on settings and holidays (with type distinction)
  const getExcludedDays = () => {
    const weekends: number[] = [];
    const customHolidays: number[] = [];
    const presetHolidays: number[] = [];

    for (let day = 1; day <= new Date(currentYear, currentMonth + 1, 0).getDate(); day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();

      // Check weekends
      if (excludeWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        weekends.push(day);
        continue;
      }

      // Check holidays
      if (skipHolidays) {
        const matchingHoliday = holidays.find(h => {
          const holidayDate = new Date(h.rawDate);
          return holidayDate.getDate() === day &&
                 holidayDate.getMonth() === currentMonth &&
                 holidayDate.getFullYear() === currentYear;
        });

        if (matchingHoliday) {
          if (matchingHoliday.isPreset) {
            presetHolidays.push(day);
          } else {
            customHolidays.push(day);
          }
        }
      }
    }

    return { weekends, customHolidays, presetHolidays };
  };

  const { weekends, customHolidays, presetHolidays } = getExcludedDays();

  // Group holidays by country for preset display
  const presetHolidayGroups = holidays
    .filter(h => h.isPreset)
    .reduce((acc, holiday) => {
      // Extract country name from holiday name (e.g., "Christmas (Germany)" -> "Germany")
      const match = holiday.name.match(/\(([^)]+)\)$/);
      const country = match ? match[1] : "Unknown";
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(holiday);
      return acc;
    }, {} as Record<string, typeof holidays>);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Comprehensive country list with ISO codes
  const countries = [
    { code: "AF", name: "Afghanistan" },
    { code: "AL", name: "Albania" },
    { code: "DZ", name: "Algeria" },
    { code: "AR", name: "Argentina" },
    { code: "AM", name: "Armenia" },
    { code: "AU", name: "Australia" },
    { code: "AT", name: "Austria" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "BH", name: "Bahrain" },
    { code: "BD", name: "Bangladesh" },
    { code: "BY", name: "Belarus" },
    { code: "BE", name: "Belgium" },
    { code: "BZ", name: "Belize" },
    { code: "BO", name: "Bolivia" },
    { code: "BA", name: "Bosnia and Herzegovina" },
    { code: "BR", name: "Brazil" },
    { code: "BG", name: "Bulgaria" },
    { code: "KH", name: "Cambodia" },
    { code: "CA", name: "Canada" },
    { code: "CL", name: "Chile" },
    { code: "CN", name: "China" },
    { code: "CO", name: "Colombia" },
    { code: "CR", name: "Costa Rica" },
    { code: "HR", name: "Croatia" },
    { code: "CU", name: "Cuba" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czech Republic" },
    { code: "DK", name: "Denmark" },
    { code: "DO", name: "Dominican Republic" },
    { code: "EC", name: "Ecuador" },
    { code: "EG", name: "Egypt" },
    { code: "SV", name: "El Salvador" },
    { code: "EE", name: "Estonia" },
    { code: "ET", name: "Ethiopia" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GE", name: "Georgia" },
    { code: "DE", name: "Germany" },
    { code: "GR", name: "Greece" },
    { code: "GT", name: "Guatemala" },
    { code: "HN", name: "Honduras" },
    { code: "HK", name: "Hong Kong" },
    { code: "HU", name: "Hungary" },
    { code: "IS", name: "Iceland" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "IR", name: "Iran" },
    { code: "IQ", name: "Iraq" },
    { code: "IE", name: "Ireland" },
    { code: "IL", name: "Israel" },
    { code: "IT", name: "Italy" },
    { code: "JM", name: "Jamaica" },
    { code: "JP", name: "Japan" },
    { code: "JO", name: "Jordan" },
    { code: "KZ", name: "Kazakhstan" },
    { code: "KE", name: "Kenya" },
    { code: "KW", name: "Kuwait" },
    { code: "LV", name: "Latvia" },
    { code: "LB", name: "Lebanon" },
    { code: "LY", name: "Libya" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "MY", name: "Malaysia" },
    { code: "MT", name: "Malta" },
    { code: "MX", name: "Mexico" },
    { code: "MD", name: "Moldova" },
    { code: "MA", name: "Morocco" },
    { code: "NP", name: "Nepal" },
    { code: "NL", name: "Netherlands" },
    { code: "NZ", name: "New Zealand" },
    { code: "NI", name: "Nicaragua" },
    { code: "NG", name: "Nigeria" },
    { code: "NO", name: "Norway" },
    { code: "OM", name: "Oman" },
    { code: "PK", name: "Pakistan" },
    { code: "PA", name: "Panama" },
    { code: "PY", name: "Paraguay" },
    { code: "PE", name: "Peru" },
    { code: "PH", name: "Philippines" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "QA", name: "Qatar" },
    { code: "RO", name: "Romania" },
    { code: "RU", name: "Russia" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "RS", name: "Serbia" },
    { code: "SG", name: "Singapore" },
    { code: "SK", name: "Slovakia" },
    { code: "SI", name: "Slovenia" },
    { code: "ZA", name: "South Africa" },
    { code: "KR", name: "South Korea" },
    { code: "ES", name: "Spain" },
    { code: "LK", name: "Sri Lanka" },
    { code: "SE", name: "Sweden" },
    { code: "CH", name: "Switzerland" },
    { code: "SY", name: "Syria" },
    { code: "TW", name: "Taiwan" },
    { code: "TH", name: "Thailand" },
    { code: "TN", name: "Tunisia" },
    { code: "TR", name: "Turkey" },
    { code: "UA", name: "Ukraine" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "UY", name: "Uruguay" },
    { code: "VE", name: "Venezuela" },
    { code: "VN", name: "Vietnam" },
    { code: "YE", name: "Yemen" },
  ];

  // Preset holidays for popular countries (2025-2026)
  const holidayPresets: { [key: string]: { name: string; month: number; day: number }[] } = {
    DE: [ // Germany
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Good Friday", month: 4, day: 18 },
      { name: "Easter Monday", month: 4, day: 21 },
      { name: "Labour Day", month: 5, day: 1 },
      { name: "Ascension Day", month: 5, day: 29 },
      { name: "Whit Monday", month: 6, day: 9 },
      { name: "German Unity Day", month: 10, day: 3 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "Boxing Day", month: 12, day: 26 },
    ],
    AT: [ // Austria
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Epiphany", month: 1, day: 6 },
      { name: "Easter Monday", month: 4, day: 21 },
      { name: "Labour Day", month: 5, day: 1 },
      { name: "Ascension Day", month: 5, day: 29 },
      { name: "Whit Monday", month: 6, day: 9 },
      { name: "Corpus Christi", month: 6, day: 19 },
      { name: "Assumption Day", month: 8, day: 15 },
      { name: "National Day", month: 10, day: 26 },
      { name: "All Saints' Day", month: 11, day: 1 },
      { name: "Immaculate Conception", month: 12, day: 8 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "St. Stephen's Day", month: 12, day: 26 },
    ],
    GB: [ // United Kingdom
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Good Friday", month: 4, day: 18 },
      { name: "Easter Monday", month: 4, day: 21 },
      { name: "Early May Bank Holiday", month: 5, day: 5 },
      { name: "Spring Bank Holiday", month: 5, day: 26 },
      { name: "Summer Bank Holiday", month: 8, day: 25 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "Boxing Day", month: 12, day: 26 },
    ],
    US: [ // United States
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Martin Luther King Jr. Day", month: 1, day: 20 },
      { name: "Presidents' Day", month: 2, day: 17 },
      { name: "Memorial Day", month: 5, day: 26 },
      { name: "Independence Day", month: 7, day: 4 },
      { name: "Labor Day", month: 9, day: 1 },
      { name: "Columbus Day", month: 10, day: 13 },
      { name: "Veterans Day", month: 11, day: 11 },
      { name: "Thanksgiving", month: 11, day: 27 },
      { name: "Christmas Day", month: 12, day: 25 },
    ],
    FR: [ // France
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Easter Monday", month: 4, day: 21 },
      { name: "Labour Day", month: 5, day: 1 },
      { name: "Victory in Europe Day", month: 5, day: 8 },
      { name: "Ascension Day", month: 5, day: 29 },
      { name: "Whit Monday", month: 6, day: 9 },
      { name: "Bastille Day", month: 7, day: 14 },
      { name: "Assumption Day", month: 8, day: 15 },
      { name: "All Saints' Day", month: 11, day: 1 },
      { name: "Armistice Day", month: 11, day: 11 },
      { name: "Christmas Day", month: 12, day: 25 },
    ],
    IT: [ // Italy
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Epiphany", month: 1, day: 6 },
      { name: "Easter Monday", month: 4, day: 21 },
      { name: "Liberation Day", month: 4, day: 25 },
      { name: "Labour Day", month: 5, day: 1 },
      { name: "Republic Day", month: 6, day: 2 },
      { name: "Assumption Day", month: 8, day: 15 },
      { name: "All Saints' Day", month: 11, day: 1 },
      { name: "Immaculate Conception", month: 12, day: 8 },
      { name: "Christmas Day", month: 12, day: 25 },
      { name: "St. Stephen's Day", month: 12, day: 26 },
    ],
    ES: [ // Spain
      { name: "New Year's Day", month: 1, day: 1 },
      { name: "Epiphany", month: 1, day: 6 },
      { name: "Good Friday", month: 4, day: 18 },
      { name: "Labour Day", month: 5, day: 1 },
      { name: "Assumption Day", month: 8, day: 15 },
      { name: "National Day", month: 10, day: 12 },
      { name: "All Saints' Day", month: 11, day: 1 },
      { name: "Constitution Day", month: 12, day: 6 },
      { name: "Immaculate Conception", month: 12, day: 8 },
      { name: "Christmas Day", month: 12, day: 25 },
    ],
  };

  // Load preset holidays for selected country
  const loadPresetHolidays = () => {
    const presets = holidayPresets[selectedCountry];
    if (!presets) {
      setErrorMessage(`No holiday presets available for this country yet.`);
      setShowErrorBanner(true);
      setTimeout(() => setShowErrorBanner(false), 3000);
      return;
    }

    // Add each preset holiday
    presets.forEach((preset) => {
      const date = new Date(currentYear, preset.month - 1, preset.day);
      const formData = new FormData();
      formData.append("action", "create");
      formData.append("name", `${preset.name} (${countries.find(c => c.code === selectedCountry)?.name})`);
      formData.append("date", date.toISOString().split('T')[0]);
      fetcher.submit(formData, { method: "post" });
    });
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Holiday"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDeleteConfirm,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowDeleteModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            Are you sure you want to delete this holiday? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Holidays & Weekends
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Configure which days should be excluded from delivery calculations
        </Text>

        {/* Error Banner */}
        {showErrorBanner && (
          <div style={{ marginTop: "16px" }}>
            <Banner tone="critical" onDismiss={() => setShowErrorBanner(false)}>
              {errorMessage}
            </Banner>
          </div>
        )}
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
                  checked={excludeWeekends}
                  onChange={(e) => setExcludeWeekends(e.target.checked)}
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
                  checked={skipHolidays}
                  onChange={(e) => setSkipHolidays(e.target.checked)}
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
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
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
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                <Button
                  size="slim"
                  onClick={loadPresetHolidays}
                  disabled={!holidayPresets[selectedCountry]}
                >
                  Load {currentYear} Holidays
                </Button>
                <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
                  {holidayPresets[selectedCountry]
                    ? `${holidayPresets[selectedCountry].length} holidays available`
                    : 'No presets available yet'}
                </Text>
              </div>
            </div>

            {/* Custom Holiday Dates */}
            <div style={{ marginTop: "24px" }}>
              <Text as="p" variant="bodyMd" fontWeight="medium">
                Custom Holiday Dates
              </Text>
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Holiday name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAdd}
                    loading={fetcher.state === "submitting"}
                  >
                    <div style={{ fontSize: "18px", lineHeight: "1" }}>+</div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Loaded Holiday Presets */}
            {Object.keys(presetHolidayGroups).length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  Loaded Holiday Presets
                </Text>
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.entries(presetHolidayGroups).map(([country, countryHolidays]) => (
                    <div
                      key={country}
                      style={{
                        padding: "16px",
                        background: "#f8f9ff",
                        border: "1px solid #e0e7ff",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <Text as="p" variant="bodyMd" fontWeight="semibold">
                          <span style={{ color: "#6366f1" }}>
                            {country} ({countryHolidays.length} holidays)
                          </span>
                        </Text>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {countryHolidays.map((h) => (
                          <span
                            key={h.id}
                            style={{
                              padding: "4px 8px",
                              background: "white",
                              border: "1px solid #e0e7ff",
                              borderRadius: "4px",
                            }}
                          >
                            {h.name.replace(/\s*\([^)]+\)$/, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Holiday List */}
            {holidays.filter(h => !h.isPreset).length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <Text as="p" variant="bodyMd" fontWeight="medium">
                  Custom Holidays
                </Text>
              </div>
            )}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "0" }}>
              {holidays.filter(h => !h.isPreset).map((holiday, index) => (
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
                    onClick={() => handleDeleteClick(holiday.id)}
                    disabled={fetcher.state === "submitting"}
                    style={{
                      padding: "8px",
                      background: "transparent",
                      border: "none",
                      cursor: fetcher.state === "submitting" ? "not-allowed" : "pointer",
                      color: "#6b7280",
                      opacity: fetcher.state === "submitting" ? 0.5 : 1,
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
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    padding: "8px",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <Text as="p" variant="bodySm" tone="subdued">
                  {monthNames[currentMonth]} {currentYear}
                </Text>
                <button
                  onClick={handleNextMonth}
                  style={{
                    padding: "8px",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
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
                    const isWeekend = day && weekends.includes(day);
                    const isCustomHoliday = day && customHolidays.includes(day);
                    const isPresetHoliday = day && presetHolidays.includes(day);

                    let bgColor = "transparent";
                    let textColor = "#1f2937";
                    let fontWeight = "400";

                    if (isWeekend) {
                      bgColor = "#fee2e2"; // Light red for weekends
                      textColor = "#dc2626";
                      fontWeight = "600";
                    } else if (isPresetHoliday) {
                      bgColor = "#e0e7ff"; // Light purple for preset holidays
                      textColor = "#6366f1";
                      fontWeight = "600";
                    } else if (isCustomHoliday) {
                      bgColor = "#fef3c7"; // Light yellow for custom holidays
                      textColor = "#f59e0b";
                      fontWeight = "600";
                    }

                    return (
                      <div
                        key={dayIndex}
                        style={{
                          aspectRatio: "1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          background: bgColor,
                          fontSize: "14px",
                          fontWeight,
                          color: textColor,
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
                      background: "#fee2e2",
                    }}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    Weekends
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                      background: "#e0e7ff",
                    }}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    Preset holidays (loaded from country)
                  </Text>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "4px",
                      background: "#fef3c7",
                    }}
                  />
                  <Text as="span" variant="bodySm" tone="subdued">
                    Custom holidays (manually added)
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
            <Button variant="primary" onClick={handleSaveSettings} loading={fetcher.state === "submitting"}>
              Save Holiday Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
