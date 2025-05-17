import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PythonShell } from 'python-shell';

@Injectable()
export class SummaryService {
  constructor(private configService: ConfigService) {}

  async getSummary(meetingId: string): Promise<string> {
    try {
      const transcriptionPath = path.join(
        process.cwd(),
        'transcriptions',
        `${meetingId}.txt`
      );

      // Check if transcription file exists
      try {
        await fs.access(transcriptionPath);
      } catch {
        throw new NotFoundException('No transcription found for this meeting');
      }

      // Read transcription file
      const transcription = await fs.readFile(transcriptionPath, 'utf-8');

      // Write transcription to temp file for Python
      await fs.writeFile('transcription.txt', transcription);

      // Run Python script for summarization
      const options = {
        scriptPath: process.cwd(),
        args: []
      };

      return new Promise((resolve, reject) => {
        PythonShell.run('summary.py', options, (err, results) => {
          if (err) {
            console.error('Python execution error:', err);
            reject(new Error('Failed to generate summary'));
            return;
          }

          if (!results || results.length === 0) {
            resolve('No summary available');
            return;
          }

          resolve(results.join('\n').trim());
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Summary generation error:', error);
      throw new Error('Failed to generate summary');
    }
  }
}