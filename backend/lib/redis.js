import { Redis } from '@upstash/redis'
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
  url: 'https://shining-toad-60595.upstash.io',
  token: process.env.UPSTASH_REDIS_TOKEN,
})
