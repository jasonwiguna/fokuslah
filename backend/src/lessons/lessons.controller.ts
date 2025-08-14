import { Controller, Get, Query, Req, UseGuards, Param, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { LessonsService } from './lessons.service';

@ApiTags('Lessons')
@Controller('api/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all lessons with user progress' })
  async getLessonsWithProgress(@Req() req: Request) {
    try {
      // Assume userId is available from auth middleware/session (e.g. req.user.id)
      // For demo, fallback to ?userId= in query
      const userId = req['user']?.id || req.query['userId'];
      if (!userId) {
        return { code: 400, error: 'Missing userId' };
      }
      return await this.lessonsService.getLessonsWithProgress(Number(userId));
    } catch (error) {
      console.error(error);
      return { code: 500, error: 'Failed to fetch lessons', details: error?.message };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lesson and its problems (no correct answers leaked)' })
  @ApiParam({ name: 'id', type: Number })
  async getLessonWithProblems(@Param('id') id: number) {
    try {
      const result = await this.lessonsService.getLessonWithProblems(id);
      if (!result) {
        return { code: 404, error: 'Lesson not found' };
      }
      return result;
    } catch (error) {
      console.error(error);
      return { code: 500, error: 'Failed to fetch lesson', details: error?.message };
    }
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit answers for a lesson attempt' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        attempt_id: { type: 'string' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              problem_id: { type: 'number' },
              answer: { type: 'string' },
            },
          },
        },
        userId: { type: 'number', nullable: true },
      },
      required: ['attempt_id', 'answers'],
    },
  })
  async submitLesson(
    @Param('id') lessonId: number,
    @Body() body: { attempt_id: string; answers: { problem_id: number; answer: string }[]; userId?: number },
    @Req() req: Request
  ) {
    try {
      const userId = req['user']?.id || body.userId;
      if (!userId) {
        return { code: 400, error: 'Missing userId' };
      }
      return await this.lessonsService.submitLesson(Number(userId), lessonId, body.attempt_id, body.answers);
    } catch (error) {
      console.error(error);
      return { code: 500, error: 'Failed to submit lesson', details: error?.message };
    }
  }
}
