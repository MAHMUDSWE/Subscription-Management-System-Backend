import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getRedisConfig = async (
  configService: ConfigService,
): Promise<CacheModuleOptions> => ({
  store: await redisStore({
    socket: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
    ttl: 60 * 60 * 1000, 
  }),
});