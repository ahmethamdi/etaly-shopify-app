import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Text, Modal } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useState, useEffect, useRef } from "react";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    let store = await db.store.findUnique({
      where: { shop },
      include: { settings: true },
    });

    if (!store) {
      store = await db.store.create({
        data: { shop, plan: "free", isActive: true },
        include: { settings: true },
      });
    }

    if (!store.settings) {
      await db.settings.create({
        data: {
          storeId: store.id,
          defaultLanguage: "en",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "24",
          debugMode: false,
          targetingMode: "all",
        },
      });
      store = await db.store.findUnique({
        where: { shop },
        include: { settings: true },
      });
    }

    return json({
      shop: session.shop,
      store,
      settings: store?.settings,
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return json({ shop: session.shop, store: null, settings: null });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  try {
    const store = await db.store.findUnique({ where: { shop } });
    if (!store) {
      return json({ success: false, error: "Store not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const updateData: any = {};

    if (formData.has("defaultLanguage")) updateData.defaultLanguage = formData.get("defaultLanguage");
    if (formData.has("dateFormat")) updateData.dateFormat = formData.get("dateFormat");
    if (formData.has("timeFormat")) updateData.timeFormat = formData.get("timeFormat");
    if (formData.has("customCSS")) updateData.customCSS = formData.get("customCSS");
    if (formData.has("debugMode")) updateData.debugMode = formData.get("debugMode") === "true";
    if (formData.has("isActive")) {
      await db.store.update({
        where: { id: store.id },
        data: { isActive: formData.get("isActive") === "true" },
      });
    }

    let settings = await db.settings.findUnique({ where: { storeId: store.id } });

    if (settings) {
      settings = await db.settings.update({
        where: { storeId: store.id },
        data: updateData,
      });
    } else {
      settings = await db.settings.create({
        data: { storeId: store.id, ...updateData },
      });
    }

    return json({ success: true, settings, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return json({ success: false, error: "Failed to save settings" }, { status: 500 });
  }
};

export default function Settings() {
  const { store, settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [appStatus, setAppStatus] = useState(store?.isActive ?? true);
  const [debugMode, setDebugMode] = useState(settings?.debugMode ?? false);
  const [language, setLanguage] = useState(settings?.defaultLanguage ?? "en");
  const [dateFormat, setDateFormat] = useState(settings?.dateFormat ?? "DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState(settings?.timeFormat ?? "24");
  const [customCSS, setCustomCSS] = useState(settings?.customCSS ?? "");
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setAppStatus(store?.isActive ?? true);
      setDebugMode(settings.debugMode);
      setLanguage(settings.defaultLanguage);
      setDateFormat(settings.dateFormat);
      setTimeFormat(settings.timeFormat);
      setCustomCSS(settings.customCSS ?? "");
    }
  }, [settings, store]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("isActive", appStatus.toString());
    formData.append("debugMode", debugMode.toString());
    formData.append("defaultLanguage", language);
    formData.append("dateFormat", dateFormat);
    formData.append("timeFormat", timeFormat);
    formData.append("customCSS", customCSS);

    fetcher.submit(formData, { method: "post" });
  };

  const handleExport = () => {
    window.open("/api/settings/export", "_blank");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setShowImportModal(true);
  };

  const handleImportConfirm = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/settings/import", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Settings imported successfully! Reloading page...");
        window.location.reload();
      } else {
        const data = await response.json();
        alert(`Failed to import: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import settings");
    } finally {
      setIsImporting(false);
      setShowImportModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (response.ok) {
        alert("All settings reset! Reloading page...");
        window.location.reload();
      } else {
        alert("Failed to reset settings");
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Failed to reset settings");
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
    }
  };

  const isSaving = fetcher.state === "submitting";

  return (
    <div style={{ padding: "24px", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Text as="h1" variant="headingLg" fontWeight="bold">
          Settings
        </Text>
        <Text as="p" variant="bodySm" tone="subdued" fontWeight="regular">
          Configure global app preferences and advanced options
        </Text>
      </div>

      {/* App Status */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7" />
              </svg>
            </div>
            <div>
              <Text as="h2" variant="headingMd" fontWeight="semibold">
                App Status
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Delivery ETA is active and visible to customers
              </Text>
            </div>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: "60px", height: "32px" }}>
            <input
              type="checkbox"
              checked={appStatus}
              onChange={(e) => setAppStatus(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: appStatus ? "#10b981" : "#d1d5db",
                transition: "0.4s",
                borderRadius: "32px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  content: "",
                  height: "24px",
                  width: "24px",
                  left: appStatus ? "32px" : "4px",
                  bottom: "4px",
                  backgroundColor: "white",
                  transition: "0.4s",
                  borderRadius: "50%",
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Language & Region */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#2563eb" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Language & Region
          </Text>
        </div>

        <div>
          <Text as="label" variant="bodySm" fontWeight="medium">
            <span style={{ display: "block", marginBottom: "8px" }}>Default Language</span>
          </Text>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option>English</option>
            <option>Deutsch</option>
            <option>Français</option>
            <option>Español</option>
            <option>Italiano</option>
          </select>
          <Text as="p" variant="bodySm" tone="subdued">
            <span style={{ display: "block", marginTop: "8px" }}>
              This will be used for ETA messages when customer language is not detected
            </span>
          </Text>
        </div>
      </div>

      {/* Date & Time Format */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#10b981" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Date & Time Format
          </Text>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <Text as="label" variant="bodySm" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>Date Format</span>
            </Text>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>DD/MM/YYYY (14/03/2025)</option>
              <option>MM/DD/YYYY (03/14/2025)</option>
              <option>YYYY-MM-DD (2025-03-14)</option>
            </select>
          </div>

          <div>
            <Text as="label" variant="bodySm" fontWeight="medium">
              <span style={{ display: "block", marginBottom: "8px" }}>Time Format</span>
            </Text>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option>24-hour (14:00)</option>
              <option>12-hour (2:00 PM)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            padding: "12px 16px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <Text as="p" variant="bodySm" fontWeight="medium">
            <span style={{ color: "#6b7280" }}>
              <strong>Preview:</strong> Order now – arrives by 14/03/2025
            </span>
          </Text>
        </div>
      </div>

      {/* Custom CSS */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" fill="none" stroke="#f59e0b" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <Text as="h2" variant="headingMd" fontWeight="semibold">
              Custom CSS
            </Text>
          </div>
          <div
            style={{
              padding: "4px 12px",
              background: "#f59e0b",
              borderRadius: "6px",
            }}
          >
            <Text as="span" variant="bodySm" fontWeight="semibold">
              <span style={{ color: "white" }}>Pro</span>
            </Text>
          </div>
        </div>

        <textarea
          placeholder="/* Add your custom CSS here */"
          rows={6}
          value={customCSS}
          onChange={(e) => setCustomCSS(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "13px",
            fontFamily: "monospace",
            resize: "vertical",
            background: "#f9fafb",
          }}
        />
      </div>

      {/* Debug Mode */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="20" height="20" fill="none" stroke="#dc2626" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text as="h2" variant="headingMd" fontWeight="semibold">
            Debug Mode
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              accentColor: "#2563eb",
            }}
          />
          <div>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              Enable Debug Mode
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Show detailed calculation logs in browser console for troubleshooting
            </Text>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          <span style={{ display: "block", marginBottom: "20px" }}>Data Management</span>
        </Text>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Export Settings */}
          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Export Settings
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Download all delivery rules and configuration as JSON
              </Text>
            </div>
            <button
              onClick={handleExport}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export
            </button>
          </div>

          {/* Import Settings */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <div
            style={{
              padding: "16px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Import Settings
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Restore configuration from a previously exported file
              </Text>
            </div>
            <button
              onClick={handleImportClick}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Import
            </button>
          </div>

          {/* Reset All Settings */}
          <div
            style={{
              padding: "16px",
              border: "2px solid #dc2626",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fef2f2",
            }}
          >
            <div>
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                <span style={{ color: "#dc2626" }}>Reset All Settings</span>
              </Text>
              <Text as="p" variant="bodySm">
                <span style={{ color: "#991b1b" }}>Clear all rules and return to default configuration</span>
              </Text>
            </div>
            <button
              onClick={handleResetClick}
              style={{
                padding: "8px 16px",
                background: "white",
                border: "1px solid #dc2626",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          <span style={{ display: "block", marginBottom: "20px" }}>App Information</span>
        </Text>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "4px" }}>Version</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              1.0.2
            </Text>
          </div>
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "4px" }}>Last Updated</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              Dec 10, 2024
            </Text>
          </div>
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "4px" }}>Store ID</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              shop_abc123xyz
            </Text>
          </div>
          <div>
            <Text as="p" variant="bodySm" tone="subdued">
              <span style={{ display: "block", marginBottom: "4px" }}>Environment</span>
            </Text>
            <Text as="p" variant="bodyMd" fontWeight="medium">
              Production
            </Text>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <a
            href="#"
            style={{
              color: "#2563eb",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Documentation
          </a>
          <span style={{ color: "#d1d5db" }}>•</span>
          <a
            href="#"
            style={{
              color: "#2563eb",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Support
          </a>
          <span style={{ color: "#d1d5db" }}>•</span>
          <a
            href="#"
            style={{
              color: "#2563eb",
              fontSize: "14px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Report a Bug
          </a>
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        {fetcher.data && typeof fetcher.data === 'object' && 'success' in fetcher.data && fetcher.data.success && (
          <div style={{
            padding: "12px 16px",
            background: "#d1fae5",
            color: "#047857",
            borderRadius: "8px",
            marginRight: "auto",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            ✓ {'message' in fetcher.data ? String(fetcher.data.message) : 'Settings saved'}
          </div>
        )}
        {fetcher.data && typeof fetcher.data === 'object' && 'error' in fetcher.data && (
          <div style={{
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            marginRight: "auto",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            ✗ {String(fetcher.data.error)}
          </div>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: isSaving ? "#9ca3af" : "#2563eb",
            color: "white",
            fontSize: "14px",
            fontWeight: "600",
            cursor: isSaving ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: "2" }}>
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Import Confirmation Modal */}
      <Modal
        open={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        title="Import Settings?"
        primaryAction={{
          content: isImporting ? "Importing..." : "Import Settings",
          onAction: handleImportConfirm,
          disabled: isImporting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setShowImportModal(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            },
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            This will replace your current settings with the imported configuration. Your existing settings will be overwritten.
          </Text>
          <br />
          <Text as="p" variant="bodyMd" fontWeight="bold">
            Are you sure you want to continue?
          </Text>
        </Modal.Section>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset All Settings?"
        primaryAction={{
          content: isResetting ? "Resetting..." : "Reset All Settings",
          onAction: handleResetConfirm,
          destructive: true,
          disabled: isResetting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowResetModal(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            This will reset all ETAly settings, delivery rules, holidays, and templates to defaults. This action cannot be undone.
          </Text>
          <br />
          <Text as="p" variant="bodyMd" fontWeight="bold">
            Are you sure you want to continue?
          </Text>
        </Modal.Section>
      </Modal>
    </div>
  );
}
