import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { SpeechClient } from '@google-cloud/speech';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const meetingId = formData.get('meetingId') as string;

    // Initialize Google Cloud Speech client
    const speechClient = new SpeechClient(); // Use proper client initialization

    // Convert audio blob to Buffer
    const audioBuffer = Buffer.from(await audio.arrayBuffer());

    // Transcribe audio with proper types
    const [response] = await speechClient.recognize({
      audio: { content: audioBuffer },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
    });

    // Save transcription with proper type checking
    const transcription = response.results
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .join('\n');

    await fs.writeFile(
      path.join(process.cwd(), `transcriptions/${meetingId}.txt`),
      transcription || ''
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}