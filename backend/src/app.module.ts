import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config as typeOrmConfig } from './typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LessonsModule } from './lessons/lessons.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    LessonsModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
