import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import fetch from 'node-fetch';

@Injectable()
export class SummaryService {
  private readonly logger = new Logger(SummaryService.name);

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
      
      // Get API key
      const apiKey = this.configService.get<string>('geminiApiKey');
      if (!apiKey) {
        throw new Error('Gemini API key is not configured');
      }

      // Call Gemini API for summarization
      return await this.generateSummaryWithGemini(transcription, apiKey);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Summary generation error: ${error.message}`, error.stack);
      throw new Error('Failed to generate summary');
    }
  }

  private async generateSummaryWithGemini(
    transcription: string,
    apiKey: string
  ): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;
    
    //  Prompt for summarizing the meeting
    const prompt = `
      You are an AI assistant specialized in summarizing meeting transcripts.
      Please provide a concise summary of the key points discussed in this meeting transcript.
      Focus on:
      - Main topics discussed
      - Key decisions made
      - Action items or follow-ups
      - Important information shared

      Format your summary as clear bullet points.

      Here is the meeting transcript:
      ${transcription.substring(0, 30000)} // Limit to avoid token limits
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Gemini API error: ${JSON.stringify(errorData)}`);
        throw new Error(`Gemini API failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the text from Gemini response
      const summaryText = data.candidates[0]?.content?.parts?.[0]?.text || 'No summary could be generated';
      
      return summaryText;
    } catch (error) {
      this.logger.error(`Gemini API call failed: ${error.message}`, error.stack);
      throw new Error('Failed to generate summary with Gemini');
    }
  }
}