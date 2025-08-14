import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get user profile stats (XP, streak, progress)' })
  async getProfile(@Req() req: Request) {
    try {
      // Assume userId is available from auth middleware/session (e.g. req.user.id)
      // For demo, fallback to ?userId= in query
      const userId = req['user']?.id || req.query['userId'];
      if (!userId) {
        return { code: 400, error: 'Missing userId' };
      }
      const profile = await this.profileService.getProfile(Number(userId));
      if (!profile) {
        return { code: 404, error: 'Profile not found' };
      }
      return profile;
    } catch (error) {
      console.error(error);
      return { code: 500, error: 'Failed to fetch profile', details: error?.message };
    }
  }
}
