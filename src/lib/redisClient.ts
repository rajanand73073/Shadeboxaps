import { createClient } from "redis";
import 'dotenv/config'

const redis_url = process.env.REDIS_URL;
console.log("redish",redis_url);


const client = createClient({
  url: redis_url,
});




client.on("error", (err) => console.log("Redis Client Error", err));

export async function connectRedis(){
    if (!client.isOpen) {
        await client.connect()
        console.log(`client connected to redis`);

    }
    return client;
}

export default client;