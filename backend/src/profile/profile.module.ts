import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../entities/user.entity';
import { UserProgress } from '../entities/user_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProgress])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
