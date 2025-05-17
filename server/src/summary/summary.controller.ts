import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private summaryService: SummaryService) {}

  @Get(':meetingId')
  async getSummary(@Param('meetingId') meetingId: string) {
    try {
      const summary = await this.summaryService.getSummary(meetingId);
      return { summary };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}