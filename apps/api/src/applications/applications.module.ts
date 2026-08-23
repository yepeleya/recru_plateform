import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { RecruiterApplicationsController } from './recruiter-applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  controllers: [ApplicationsController, RecruiterApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
