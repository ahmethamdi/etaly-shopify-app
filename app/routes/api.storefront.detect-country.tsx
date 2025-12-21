import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// Public API endpoint for country detection
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Try to get country from Cloudflare header (if using Cloudflare)
    const cfCountry = request.headers.get("CF-IPCountry");
    if (cfCountry && cfCountry !== "XX") {
      return json({ success: true, countryCode: cfCountry });
    }

    // Try to get from other common headers
    const geoipCountry = request.headers.get("X-GeoIP-Country");
    if (geoipCountry) {
      return json({ success: true, countryCode: geoipCountry });
    }

    // Default to US if no detection available
    return json({ success: true, countryCode: "US" });
  } catch (error) {
    console.error("Country detection error:", error);
    return json({ success: true, countryCode: "US" });
  }
}
