import { connectDB } from "@/lib/databaseConnection";
import { getSession } from "@/lib/auth";
import { getFallbackShipping, getShiprocketShippingQuote } from "@/lib/shiprocket";
import OrderModel from "@/models/Order.model";

function jsonRes(status, message, data = null) {
  return Response.json({ ok: status < 400, message, data }, { status });
}

export async function POST(req) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session?.userId) return jsonRes(401, "Please login to place an order");

    const { items, shippingAddress, couponCode } = await req.json();

    if (!items?.length) return jsonRes(400, "Cart is empty");
    if (!shippingAddress?.name || !shippingAddress?.phone || !shippingAddress?.address ||
        !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      return jsonRes(400, "Complete shipping address is required");
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shiprocketQuote = await getShiprocketShippingQuote({ pincode: shippingAddress.pincode, items });
    const shipping = shiprocketQuote?.shippingCharge ?? getFallbackShipping(subtotal);
    let discount = 0;

    // Basic coupon check
    if (couponCode) {
      const CouponModel = (await import("@/models/Coupon.model")).default;
      const coupon = await CouponModel.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date()) && subtotal >= coupon.minOrder) {
        discount = coupon.type === "percent"
          ? Math.round((subtotal * coupon.value) / 100)
          : coupon.value;
        await CouponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const totalAmount = subtotal + shipping - discount;

    const ProductModel = (await import("@/models/Product.model")).default;
    for (const item of items) {
      const productId = item.productId || item.id;
      const product = await ProductModel.findById(productId);
      if (!product) return jsonRes(400, `Product not found: ${item.name}`);
      if (product.stock < item.qty) return jsonRes(400, `Insufficient stock for ${item.name}`);
    }

    const order = await OrderModel.create({
      user: session.userId,
      items: items.map((i) => ({
        product: i.productId || i.id,
        name: i.name,
        image: i.image,
        price: i.price,
        qty: i.qty,
      })),
      totalAmount,
      shippingAddress,
      shippingCost: shipping,
      shippingMethod: shiprocketQuote?.shippingMethod || "standard",
      courierName: shiprocketQuote?.courierName || "Standard",
      status: "Pending",
      paymentStatus: "Unpaid",
    });

    for (const item of items) {
      const productId = item.productId || item.id;
      await ProductModel.findByIdAndUpdate(productId, { $inc: { stock: -item.qty } });
    }

    return jsonRes(201, "Order placed successfully", {
      orderId: order._id,
      totalAmount,
      shipping,
      discount,
    });
  } catch (e) {
    return jsonRes(500, e instanceof Error ? e.message : "Internal Server Error");
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const session = await getSession();
    if (!session?.userId) return jsonRes(401, "Not authenticated");

    const orders = await OrderModel.find({ user: session.userId }).sort({ createdAt: -1 });
    return jsonRes(200, "Orders fetched", orders);
  } catch (e) {
    return jsonRes(500, e instanceof Error ? e.message : "Internal Server Error");
  }
}
