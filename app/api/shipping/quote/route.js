import { getFallbackShipping, getShiprocketShippingQuote, jsonRes } from "@/lib/shiprocket";

// POST /api/shipping/quote
// Body: { pincode, items:[{price,qty,weight?}] }
// - Attempts Shiprocket serviceability + rate
// - Falls back to flat rate if Shiprocket unavailable / times out
export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonRes(400, "Invalid request body");
    }
    const { pincode, items = [] } = body || {};

    if (!pincode) return jsonRes(400, "Pincode is required");
    if (!/^[1-9][0-9]{5}$/.test(String(pincode).trim())) {
      return jsonRes(400, "Please enter a valid 6-digit PIN code");
    }

    const subtotal = Array.isArray(items)
      ? items.reduce(
          (sum, item) => sum + Number(item?.price || 0) * Number(item?.qty || 1),
          0
        )
      : 0;

    // Race Shiprocket call against an 8s timeout so the API never hangs the checkout
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve(null), 8000)
    );
    let quote = null;
    try {
      quote = await Promise.race([
        getShiprocketShippingQuote({ pincode, items }),
        timeoutPromise,
      ]);
    } catch (err) {
      console.error("Shiprocket quote failed:", err);
      quote = null;
    }

    const shippingCharge = quote?.shippingCharge ?? getFallbackShipping(subtotal);

    return jsonRes(200, "Shipping quote fetched", {
      shippingCharge,
      courierName: quote?.courierName || "Standard",
      shippingMethod: quote?.shippingMethod || "standard",
      source: quote ? "shiprocket" : "fallback",
    });
  } catch (e) {
    // Never throw — always give the checkout a usable shipping value
    console.error("Shipping quote error:", e);
    return jsonRes(200, "Shipping quote (fallback)", {
      shippingCharge: getFallbackShipping(0),
      courierName: "Standard",
      shippingMethod: "standard",
      source: "fallback",
    });
  }
}
