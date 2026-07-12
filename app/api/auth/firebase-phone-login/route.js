import { connectDB } from "@/lib/databaseConnection";
import UserModel from "@/models/User.model";
import { signToken, setSessionCookie } from "@/lib/auth";

function jsonResponse(status, message, data = null) {
  return Response.json({ ok: status < 400, message, data }, { status });
}

export async function POST(request) {
  try {
    await connectDB();

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, "Invalid request body");
    }

    const { phone, name, uid } = body || {};

    if (!phone || !uid || typeof phone !== "string" || typeof uid !== "string") {
      return jsonResponse(400, "Phone number and Firebase UID are required");
    }

    const normalizedPhone = phone.trim();
    const normalizedName = (name && typeof name === "string" && name.trim()) || "Customer";
    const derivedEmail = `${uid}@firebase.local`;

    // Try to find existing user by phone OR by derived firebase email
    let user = await UserModel.findOne({
      $or: [{ phone: normalizedPhone }, { email: derivedEmail }],
    });

    if (!user) {
      try {
        user = await UserModel.create({
          name: normalizedName,
          email: derivedEmail,
          password: uid, // dummy password; user logs in via Firebase, not password
          phone: normalizedPhone,
          isEmailVerified: true,
          role: "user",
        });
      } catch (createErr) {
        // Handle race condition where user was created between findOne & create
        if (createErr && createErr.code === 11000) {
          user = await UserModel.findOne({
            $or: [{ phone: normalizedPhone }, { email: derivedEmail }],
          });
        } else {
          throw createErr;
        }
      }
    } else if (!user.phone || user.phone !== normalizedPhone) {
      // Backfill phone number if missing (existing user upgrade)
      user.phone = normalizedPhone;
      try {
        await user.save();
      } catch {
        // ignore backfill errors
      }
    }

    if (!user) {
      return jsonResponse(500, "Unable to resolve user account");
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return jsonResponse(200, "Logged in successfully", {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Firebase phone login error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return jsonResponse(500, message);
  }
}
