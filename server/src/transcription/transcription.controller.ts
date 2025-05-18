import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  Body, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionService } from './transcription.service';

@Controller('transcribe')
export class TranscriptionController {
  private readonly logger = new Logger(TranscriptionController.name);
  
  constructor(private transcriptionService: TranscriptionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('meetingId') meetingId: string,
    @Body('participants') participants?: string,
  ) {
    this.logger.log(`Received transcription request for meeting ${meetingId}`);
    
    if (!file || !meetingId) {
      throw new BadRequestException('Audio file and meeting ID are required');
    }

    // Parse participants if provided
    let participantsList: string[] = [];
    if (participants) {
      try {
        participantsList = JSON.parse(participants);
      } catch (e) {
        this.logger.warn('Failed to parse participants list, continuing without mapping');
      }
    }

    const success = await this.transcriptionService.transcribeAudio(
      file.buffer, 
      meetingId,
      participantsList
    );

    if (!success) {
      throw new BadRequestException('Failed to transcribe audio');
    }

    return { success: true };
  }
}