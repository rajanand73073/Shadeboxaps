import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import mongoose from "mongoose";



export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  console.log("session", session);

  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await UserModel.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      //unwind is used for array to convert it into objects
      {
        $unwind: "$messages",
      },
      {
        $sort: {
          "messages.createdAt": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          messages: {
            $push: "$messages",
          },
        },
      },
    ]);

    console.log("User", user);
    
    if (!user || user.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No messages found ",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User  found",
        Message: user[0].messages,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "An error occurred",
        error: error,
      },
      { status: 500 }
    );
  }
}
