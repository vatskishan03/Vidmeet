import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, DeepgramClient } from '@deepgram/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private readonly deepgram: DeepgramClient;
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('deepgramApiKey');
    if (!apiKey) throw new Error('Deepgram API key is missing');
    this.deepgram = createClient(apiKey);
  }

  async transcribeAudio(
    audioBuffer: Buffer,
    meetingId: string,
    participants: string[] = [],
  ): Promise<boolean> {
    try {
      this.logger.log(`Starting transcription for meeting ${meetingId}`);

      // Transcribe audio 
      const response = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          punctuate: true,
          diarize: true,
          utterances: true,
          model: 'nova-2',
          language: 'en-US',
        },
      );

      let transcript = '';
      const speakerMap: Record<string, string> = {};

      // Process utterances and map speakers to participant names
      if (response.result?.utterances) {
        for (const utterance of response.result.utterances) {
          const speakerId = utterance.speaker;
          if (
            participants.length > 0 &&
            !speakerMap[speakerId] &&
            Object.keys(speakerMap).length < participants.length
          ) {
            const nextName = participants.find(
              (p) => !Object.values(speakerMap).includes(p),
            );
            if (nextName) speakerMap[speakerId] = nextName;
          }
          const name = speakerMap[speakerId] || `Speaker ${speakerId}`;
          const time = this.formatTimestamp(utterance.start);
          transcript += `[${time}] ${name}: ${utterance.transcript}\n\n`;
        }
      }

      // Save transcription and speaker map to files
      const dir = path.join(process.cwd(), 'transcriptions');
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(path.join(dir, `${meetingId}.txt`), transcript);
      await fs.writeFile(
        path.join(dir, `${meetingId}-speakers.json`),
        JSON.stringify(speakerMap, null, 2),
      );

      this.logger.log(`Transcription completed for meeting ${meetingId}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Transcription error: ${error.message}`, error.stack);
      return false;
    }
  }

  private formatTimestamp(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const secs = date.getUTCSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  }
}