import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";

import { Message } from "@/model/User.model";

export async function POST(request: Request) {
  await dbConnect();

  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "userNot Found",
        },
        { status: 401 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "user is not acceptng messages",
        },
        { status: 401 }
      );
    }

    const newmessage = { content, createdAt: new Date() };
    user.messages.push(newmessage as Message);
    await user.save()
    return Response.json(
      {
        success: true,
        message: "send anonymous message",
        newmessage,
        user
      },
      { status: 200 }
    );

  }
   catch (error) {

    console.error("Erroe while sending messsage", error)

    return Response.json(
      {
        success: false,
        message: "error while sending message",
      },
      { status: 500 }
    );
  }
}
