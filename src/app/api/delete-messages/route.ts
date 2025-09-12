import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import {User} from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: Request) {

  await dbConnect();
   
  const session = await getServerSession(authOptions);

 try {
     const user: User = session?.user as User ;
   
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
   const { messageId } = await request.json();

   if (!messageId) {
       return Response.json(
           {
               success: false,
               message: "Message ID is required",
           },
           { status: 400 }
       );
   }
const deletedMessage = await UserModel.findOneAndUpdate({
    _id:userId,
    $pull:{
        messages :{
            _id: messageId
        }
    }
})

if(!deletedMessage){
    return Response.json({
        success: false,
        message: "Message not found",
    })
}

return Response.json({
    success: true,
    message: "Message deleted successfully",
})
   } catch (error) {
       console.error("Error deleting message", error);
       return Response.json(
           {
           success: false,
           message: "Internal Server Error",
       },
       { status: 500 }
   );
   }
}