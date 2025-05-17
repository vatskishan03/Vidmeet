import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptionService } from './transcription.service';

@Controller('transcribe')
export class TranscriptionController {
  constructor(private transcriptionService: TranscriptionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('meetingId') meetingId: string,
  ) {
    if (!file || !meetingId) {
      throw new BadRequestException('Audio file and meeting ID are required');
    }

    const success = await this.transcriptionService.transcribeAudio(file.buffer, meetingId);

    if (!success) {
      throw new BadRequestException('Failed to transcribe audio');
    }

    return { success: true };
  }
}