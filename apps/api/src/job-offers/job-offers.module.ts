import { Module } from '@nestjs/common';
import { JobOffersController } from './job-offers.controller';
import { RecruiterJobOffersController } from './recruiter-job-offers.controller';
import { JobOffersService } from './job-offers.service';

@Module({
  controllers: [JobOffersController, RecruiterJobOffersController],
  providers: [JobOffersService],
})
export class JobOffersModule {}
