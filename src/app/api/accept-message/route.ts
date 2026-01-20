import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 },
    );
  }

  const userId = user._id;

  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true },
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to update user status",
        },
        { status: 401 },
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated Successfully",
        updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("failed to update user ststaus to accept messages", error);
    return Response.json(
      {
        success: false,
        message: "failed to update user ststaus to accept messages",
      },
      { status: 501 },
    );
  }
}

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 },
    );
  }

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "failed to found user",
        },
        { status: 401 },
      );
    }

    return Response.json(
      {
        success: true,
        message: "User found",
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error while founduser", error);
  }
}
