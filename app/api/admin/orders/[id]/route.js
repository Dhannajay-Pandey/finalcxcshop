import { connectDB } from "@/lib/databaseConnection";
import { requireAdmin, jsonRes } from "@/lib/adminMiddleware";
import OrderModel from "@/models/Order.model";

export async function GET(_, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  try {
    await connectDB();
    const order = await OrderModel.findById(params.id).populate("user", "name email phone");
    if (!order) return jsonRes(404, "Order not found");
    return jsonRes(200, "Order fetched", order);
  } catch (e) {
    return jsonRes(500, e.message);
  }
}

export async function PUT(req, { params }) {
  const deny = await requireAdmin();
  if (deny) return deny;
  try {
    await connectDB();
    const { status, paymentStatus } = await req.json();
    const order = await OrderModel.findByIdAndUpdate(params.id, { ...(status && { status }), ...(paymentStatus && { paymentStatus }) }, { new: true });
    if (!order) return jsonRes(404, "Order not found");
    return jsonRes(200, "Order updated", order);
  } catch (e) {
    return jsonRes(500, e.message);
  }
}
