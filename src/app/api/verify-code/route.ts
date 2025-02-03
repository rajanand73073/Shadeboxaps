import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
// import { z } from "zod";
// import { usernameValidataion } from "@/Schemas/signUpSchema";

// const UsernameQuerySchema = z.object({
//   username: usernameValidataion,
// });

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, code } = await request.json();

    // const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "user not found",
        },
        { status: 500 }
      );
    }

    const isCodevalid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

  console.log("codeExpiry",isCodeNotExpired);
  


    if (isCodevalid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "User Verified Successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message: "Verification Code expired Please Signup again",
        },
        { status: 500 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Code is incorrect",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying username", error);
    return Response.json(
      {
        success: false,
        message: "Eroor verifying username",
      },
      { status: 500 }
    );
  }
}
