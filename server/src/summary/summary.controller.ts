import { Controller, Get, Param, NotFoundException, Logger } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  private readonly logger = new Logger(SummaryController.name);
  
  constructor(private summaryService: SummaryService) {}

  @Get(':meetingId')
  async getSummary(@Param('meetingId') meetingId: string) {
    this.logger.log(`Generating summary for meeting ID: ${meetingId}`);
    
    try {
      const summary = await this.summaryService.getSummary(meetingId);
      return { summary };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      this.logger.error(`Error in summary controller: ${error.message}`, error.stack);
      throw error;
    }
  }
}