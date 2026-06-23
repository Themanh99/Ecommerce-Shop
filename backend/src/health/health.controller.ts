import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get('live')
  live() {
    return {
      status: 'ok',
      service: 'moonkid-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    const checks = {
      database: false,
      redis: false,
    };

    const [database, redis] = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ]);

    checks.database = database.status === 'fulfilled';
    checks.redis =
      redis.status === 'fulfilled' && redis.value.toUpperCase() === 'PONG';

    if (!checks.database || !checks.redis) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        checks,
      });
    }

    return {
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
