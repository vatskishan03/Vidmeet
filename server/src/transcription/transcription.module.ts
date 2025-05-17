import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private speechClient: SpeechClient;
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const keyFilePath = this.configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS');
    
    this.speechClient = new SpeechClient({ keyFilename: keyFilePath });
    this.storage = new Storage({ keyFilename: keyFilePath });
    this.bucketName = this.configService.get<string>('BUCKET_NAME') || 'default-bucket';
  }

  async transcribeAudio(audioBuffer: Buffer, meetingId: string): Promise<boolean> {
    try {
      // Upload to Google Cloud Storage
      const bucket = this.storage.bucket(this.bucketName);
      const fileName = `${meetingId}-${Date.now()}.wav`;
      const file = bucket.file(fileName);
      
      await file.save(audioBuffer);
      
      // Get GCS URI
      const gcsUri = `gs://${this.bucketName}/${fileName}`;
      
      // Start transcription with GCS URI
      const [operation] = await this.speechClient.longRunningRecognize({
        audio: { uri: gcsUri },
        config: {
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
      });
      
      // Wait for operation to complete
      const [response] = await operation.promise();
      
      // Delete the file from GCS after transcription
      await file.delete();
      
      // Save transcription
      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join('\n');
      
      // Ensure transcriptions directory exists
      const transcriptionsDir = path.join(process.cwd(), 'transcriptions');
      await fs.mkdir(transcriptionsDir, { recursive: true });
      
      await fs.writeFile(
        path.join(transcriptionsDir, `${meetingId}.txt`),
        transcription || ''
      );
      
      return true;
    } catch (error) {
      console.error('Transcription error:', error);
      return false;
    }
  }
}