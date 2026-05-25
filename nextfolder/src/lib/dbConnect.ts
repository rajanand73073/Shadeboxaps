import mongoose from "mongoose";
import LocationModel from "@/model/Location.model";

type ConnectionObject = {
  isConnected?: number;
  indexesCreated?: boolean;
};

const connection: ConnectionObject = {};

async function createIndexes(): Promise<void> {
  if (connection.indexesCreated) {
    return;
  }

  await LocationModel.createIndexes();
  connection.indexesCreated = true;
}

//here void means it doesn't care what type of data are coming
async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already Connected to database");
    await createIndexes();
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || " ", {
      dbName: "shadebox",
      autoIndex: false,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      appName: "ShadeBox-API",
    });
    console.log("DB", db);

    connection.isConnected = db.connection.readyState;
    await createIndexes();

    console.log("dbconnection", db.connection);
    console.log("connection", connection.isConnected);

    console.log("DB connected Successfully");
  } catch (error) {
    console.log("DB connection failed", error);

    process.exit(1);
  }
}

export default dbConnect;
