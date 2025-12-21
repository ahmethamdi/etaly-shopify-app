// Translation system for ETAly
export const translations = {
  en: {
    // Dashboard
    dashboard: "Dashboard",
    deliveryRules: "Delivery Rules",
    holidays: "Holidays & Weekends",
    multiCountry: "Multi-Country Setup",
    productTargeting: "Product Targeting",
    cartCheckout: "Cart & Checkout",
    messageTemplates: "Message Templates",
    analytics: "Analytics",
    plansBilling: "Plans & Billing",
    settings: "Settings",

    // Plans
    freePlan: "Free Plan",
    proPlan: "Pro Plan",
    advancedPlan: "Advanced Plan",
    upgradeToPro: "Upgrade to Pro",
    oneRuleOneCountry: "1 rule • 1 country",
    unlimitedRulesCountries: "Unlimited rules & countries",
    everythingMultiStore: "Everything + Multi-store",
  },
  tr: {
    // Dashboard
    dashboard: "Kontrol Paneli",
    deliveryRules: "Teslimat Kuralları",
    holidays: "Tatil Günleri & Hafta Sonları",
    multiCountry: "Çok Ülkeli Kurulum",
    productTargeting: "Ürün Hedefleme",
    cartCheckout: "Sepet & Ödeme",
    messageTemplates: "Mesaj Şablonları",
    analytics: "Analitikler",
    plansBilling: "Planlar & Faturalama",
    settings: "Ayarlar",

    // Plans
    freePlan: "Ücretsiz Plan",
    proPlan: "Pro Plan",
    advancedPlan: "Gelişmiş Plan",
    upgradeToPro: "Pro'ya Yükselt",
    oneRuleOneCountry: "1 kural • 1 ülke",
    unlimitedRulesCountries: "Sınırsız kural & ülke",
    everythingMultiStore: "Her Şey + Çoklu Mağaza",
  },
  de: {
    // Dashboard
    dashboard: "Dashboard",
    deliveryRules: "Lieferregeln",
    holidays: "Feiertage & Wochenenden",
    multiCountry: "Multi-Länder-Setup",
    productTargeting: "Produkt-Targeting",
    cartCheckout: "Warenkorb & Kasse",
    messageTemplates: "Nachrichtenvorlagen",
    analytics: "Analytik",
    plansBilling: "Pläne & Abrechnung",
    settings: "Einstellungen",

    // Plans
    freePlan: "Kostenloser Plan",
    proPlan: "Pro Plan",
    advancedPlan: "Erweiterter Plan",
    upgradeToPro: "Upgrade auf Pro",
    oneRuleOneCountry: "1 Regel • 1 Land",
    unlimitedRulesCountries: "Unbegrenzte Regeln & Länder",
    everythingMultiStore: "Alles + Multi-Store",
  },
  es: {
    // Dashboard
    dashboard: "Panel de Control",
    deliveryRules: "Reglas de Entrega",
    holidays: "Vacaciones & Fines de Semana",
    multiCountry: "Configuración Multi-País",
    productTargeting: "Segmentación de Productos",
    cartCheckout: "Carrito & Pago",
    messageTemplates: "Plantillas de Mensajes",
    analytics: "Analíticas",
    plansBilling: "Planes & Facturación",
    settings: "Configuración",

    // Plans
    freePlan: "Plan Gratuito",
    proPlan: "Plan Pro",
    advancedPlan: "Plan Avanzado",
    upgradeToPro: "Actualizar a Pro",
    oneRuleOneCountry: "1 regla • 1 país",
    unlimitedRulesCountries: "Reglas & países ilimitados",
    everythingMultiStore: "Todo + Multi-tienda",
  },
  fr: {
    // Dashboard
    dashboard: "Tableau de Bord",
    deliveryRules: "Règles de Livraison",
    holidays: "Jours Fériés & Week-ends",
    multiCountry: "Configuration Multi-Pays",
    productTargeting: "Ciblage de Produits",
    cartCheckout: "Panier & Paiement",
    messageTemplates: "Modèles de Messages",
    analytics: "Analytiques",
    plansBilling: "Plans & Facturation",
    settings: "Paramètres",

    // Plans
    freePlan: "Plan Gratuit",
    proPlan: "Plan Pro",
    advancedPlan: "Plan Avancé",
    upgradeToPro: "Passer à Pro",
    oneRuleOneCountry: "1 règle • 1 pays",
    unlimitedRulesCountries: "Règles & pays illimités",
    everythingMultiStore: "Tout + Multi-boutique",
  },
  it: {
    // Dashboard
    dashboard: "Pannello di Controllo",
    deliveryRules: "Regole di Consegna",
    holidays: "Festività & Fine Settimana",
    multiCountry: "Configurazione Multi-Paese",
    productTargeting: "Targeting Prodotti",
    cartCheckout: "Carrello & Checkout",
    messageTemplates: "Modelli di Messaggi",
    analytics: "Analitiche",
    plansBilling: "Piani & Fatturazione",
    settings: "Impostazioni",

    // Plans
    freePlan: "Piano Gratuito",
    proPlan: "Piano Pro",
    advancedPlan: "Piano Avanzato",
    upgradeToPro: "Passa a Pro",
    oneRuleOneCountry: "1 regola • 1 paese",
    unlimitedRulesCountries: "Regole & paesi illimitati",
    everythingMultiStore: "Tutto + Multi-negozio",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: string, key: TranslationKey): string {
  const language = (lang in translations ? lang : "en") as Language;
  return translations[language][key] || translations.en[key];
}
