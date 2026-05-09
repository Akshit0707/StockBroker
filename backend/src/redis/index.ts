import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
export const redisClient= new Redis(redisUrl);

export const redisSub= new Redis(redisUrl);

redisClient.on('connect', ()=>console.log('Connected to Redis successfully.'));
redisClient.on('error', (err)=>console.error('Redis connection error:', err));

redisSub.on('connect', ()=>console.log('Connected to Redis Pub/Sub successfully.'));
redisSub.on('error', (err)=>console.error('Redis Pub/Sub connection error:', err));

redisSub.subscribe('price_update', 'orders_update', 'trade_update');

export const setCache = async (key: string, value: any, ttlSeconds: number = 60) => {
  await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
};

export const getCache= async<T>(key:string): Promise<T | null> => {
    const data= await redisClient.get(key);
    if(!data) return null;
    return JSON.parse(data) as T;
};

export const deleteCache = async (key: string) => {
  await redisClient.del(key);
};

export const publish = async (channel: string, message: any) => {
  await redisClient.publish(channel, JSON.stringify(message));
};
