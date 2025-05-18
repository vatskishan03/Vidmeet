import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Deepgram } from '@deepgram/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private readonly deepgram: Deepgram;
  private readonly logger = new Logger(TranscriptionService.name);
  
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('deepgramApiKey');
    if (!apiKey) throw new Error('Deepgram API key is missing');
    this.deepgram = new Deepgram(apiKey);
  }
  
  async transcribeAudio(
    audioBuffer: Buffer,
    meetingId: string,
    participants: string[] = [],
  ): Promise<boolean> {
    try {
      this.logger.log(`Starting transcription for meeting ${meetingId}`);
      
      // Use Deepgram preRecorded transcription API
      const response = await this.deepgram.transcription.preRecorded(
        { buffer: audioBuffer, mimetype: 'audio/wav' },
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
      
      if (response.results?.utterances) {
        for (const u of response.results.utterances) {
          const speakerId = u.speaker;
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
          const time = this.formatTimestamp(u.start);
          transcript += `[${time}] ${name}: ${u.transcript}\n\n`;
        }
      }
      
      const dir = path.join(process.cwd(), 'transcriptions');
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(path.join(dir, `${meetingId}.txt`), transcript);
      await fs.writeFile(
        path.join(dir, `${meetingId}-speakers.json`),
        JSON.stringify(speakerMap, null, 2),
      );
      
      this.logger.log(`Transcription completed for meeting ${meetingId}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Transcription error: ${err.message}`, err.stack);
      return false;
    }
  }
  
  private formatTimestamp(sec: number): string {
    const d = new Date(sec * 1000);
    const hh = d.getUTCHours().toString().padStart(2, '0');
    const mm = d.getUTCMinutes().toString().padStart(2, '0');
    const ss = d.getUTCSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}