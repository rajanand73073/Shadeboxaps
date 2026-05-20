import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User.model";
// import { z } from "zod";
// import { usernameValidataion } from "@/Schemas/signUpSchema";

// const UsernameQuerySchema = z.object({
//   username: usernameValidataion,
// });

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { email, code } = await request.json();
    const normalizedEmail = decodeURIComponent(email).toLowerCase().trim();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 500 },
      );
    }

    const isCodevalid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodevalid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "User Verified Successfully",
        },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      await UserModel.deleteOne({ _id: user._id, isVerified: false });

      return Response.json(
        {
          success: false,
          message: "Verification code expired. Please sign up again.",
        },
        { status: 400 },
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Code is incorrect",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error verifying email", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying email",
      },
      { status: 500 },
    );
  }
}
