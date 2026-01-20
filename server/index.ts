import * as dotenv from "dotenv";
dotenv.config();
import app from "./app";
import initializeSocket from "./socket.server";
import { createServer } from "http"; // Import createServer
import { connectRedis } from "../src/lib/redisClient";

// const server: HttpServer = app.listen(process.env.PORT || 8000, () => {
//   console.log(`server is running at port : ${process.env.PORT}`);
// });
const httpServer = createServer(app);

httpServer.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running at port : ${process.env.PORT || 8000} `);
});

connectRedis();

initializeSocket(httpServer);
//By using createServer(app), you are explicitly bridging Express and Socket.io into a single unit before any traffic arrives.
