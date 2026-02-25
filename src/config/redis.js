import { createClient } from "redis";

const client = createClient({
    url: "redis://localhost:6379"
});

client.on("error", (err) => {
    console.error("Redis Client Error", err);
});

export const connectRedis = async () => {
    try{
        await client.connect();
        console.log("Redis Connected");
    } catch (error) {
        console.error("Unable to connect to Redis:", error);
        throw error;
    }
};

export default client;