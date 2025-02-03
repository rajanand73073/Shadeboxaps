import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already Connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || " ", {});

    console.log("DB", db);

    connection.isConnected = db.connection.readyState;

    console.log("dbconnection",db.connection);
    console.log("connection",connection.isConnected);

    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB connection failed", error);

    process.exit(1);
  }
}

export default dbConnect;
