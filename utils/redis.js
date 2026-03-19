import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
    try {
        if (process.env.REDIS_ENABLED === 'false') {
            console.log('Redis disabled via REDIS_ENABLED=false');
            return null;
        }

        if (redisClient) {
            return redisClient;
        }

        redisClient = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
                reconnectStrategy: () => false
            },
            password: process.env.REDIS_PASSWORD || undefined,
            legacyMode: false
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Redis client connected');
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('Redis connection error:', error);
        redisClient = null;
        return null;
    }
};

export const getRedisClient = () => {
    return redisClient;
};

// Cache middleware for Express routes
export const cacheMiddleware = (duration = 300) => {
    return async (req, res, next) => {
        if (!redisClient || !redisClient.isOpen) {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedData = await redisClient.get(key);
            
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }

            // Store original res.json
            const originalJson = res.json.bind(res);

            // Override res.json
            res.json = (data) => {
                // Cache the response
                redisClient.setEx(key, duration, JSON.stringify(data)).catch(err => {
                    console.error('Cache set error:', err);
                });
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

// Helper function to invalidate cache
export const invalidateCache = async (pattern) => {
    if (!redisClient || !redisClient.isOpen) {
        return;
    }

    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};

export default { connectRedis, getRedisClient, cacheMiddleware, invalidateCache };
