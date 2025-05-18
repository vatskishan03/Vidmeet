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
    
    if (!apiKey) {
      throw new Error('Deepgram API key is missing');
    }
    
    this.deepgram = new Deepgram(apiKey);
  }
  
  async transcribeAudio(audioBuffer: Buffer, meetingId: string, participants: string[] = []): Promise<boolean> {
    try {
      this.logger.log(`Starting transcription for meeting ${meetingId}`);
      
      // Send audio to Deepgram
      const response = await this.deepgram.transcription.preRecorded({
        buffer: audioBuffer,
        mimetype: 'audio/wav',
      }, {
        punctuate: true,
        diarize: true, // Enable speaker diarization
        utterances: true,
        model: 'nova-2',
        language: 'en-US',
      });
      
      // Extract speakers, timestamps and transcriptions
      let transcript = '';
      let speakerMap: Record<string, string> = {};
      
      if (response.results?.channels?.[0]?.alternatives?.[0]?.paragraphs) {
        const paragraphs = response.results.channels[0].alternatives[0].paragraphs;
        
        // Map speaker labels to participant names if available
        paragraphs.paragraphs.forEach((paragraph) => {
          const speakerId = paragraph.speaker;
          
          // Assign participant names to speakers when possible
          if (participants.length > 0 && !speakerMap[speakerId] && 
              Object.keys(speakerMap).length < participants.length) {
            const nextAvailableParticipant = participants.find(
              p => !Object.values(speakerMap).includes(p)
            );
            if (nextAvailableParticipant) {
              speakerMap[speakerId] = nextAvailableParticipant;
            }
          }
          
          const speakerName = speakerMap[speakerId] || `Speaker ${speakerId}`;
          const formattedStart = this.formatTimestamp(paragraph.start);
          
          transcript += `[${formattedStart}] ${speakerName}: ${paragraph.text}\n\n`;
        });
      }
      
      // Ensure transcriptions directory exists
      const transcriptionsDir = path.join(process.cwd(), 'transcriptions');
      await fs.mkdir(transcriptionsDir, { recursive: true });
      
      // Save the full transcript with speaker information
      await fs.writeFile(
        path.join(transcriptionsDir, `${meetingId}.txt`),
        transcript
      );
      
      // Save speaker mapping separately for future reference
      await fs.writeFile(
        path.join(transcriptionsDir, `${meetingId}-speakers.json`),
        JSON.stringify(speakerMap, null, 2)
      );
      
      this.logger.log(`Transcription completed for meeting ${meetingId}`);
      return true;
    } catch (error) {
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