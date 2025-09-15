import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";



export const authOptions: NextAuthOptions = {
 
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        identifier :{label:'username or email', type:'text'},
        password: { label: "Password", type: "password" },
        verifyCode: { label: "Verification Code", type: "text" },
      },

      async authorize(credentials: Record<string, string> | undefined, ) {
      if (!credentials) return null;

  try {
    await dbConnect();

    const user = await UserModel.findOne({
      $or: [
        { email: credentials.identifier },
        { username: credentials.identifier },
      ],
    });

    if (!user) {
      throw new Error("No user found with this identifier.");
    }

    if (!user.isVerified) {
      throw new Error("Please verify your account before logging in.");
    }

    if (credentials.password) {
      const isPasswordCorrect = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordCorrect) {
        throw new Error("Incorrect password.");
      }
    }

    const isCodeValid = credentials.verifyCode
      ? user.verifyCode === credentials.verifyCode
      : true;

    if (!isCodeValid) {
      throw new Error("Invalid verification code.");
    }

    return {
     id:user._id.toString(),
    _id:user._id.toString(),
    username:user.username,
    isVerified:user.isVerified,
    isAcceptingMessage:user.isAcceptingMessage
  };
  } catch (err) {
    const error = err as Error;
    throw new Error(error.message || "Authentication failed.");
  }
},
}),
],
callbacks: {
async jwt({ token, user }) {
if (user) {
        token._id = user._id;
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          _id: token._id,
          username: token.username,
          isVerified: token.isVerified,
          isAcceptingMessage: token.isAcceptingMessage,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
