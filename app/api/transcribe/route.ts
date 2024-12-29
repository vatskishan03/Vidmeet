import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { SpeechClient } from '@google-cloud/speech';

// Force Node.js runtime
export const runtime = 'nodejs';
// Add dynamic config
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const meetingId = formData.get('meetingId') as string;

    // Initialize Google Cloud clients
    const speechClient = new SpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    const storage = new Storage({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    const bucketName = process.env.BUCKET_NAME || 'default-bucket';
 
    const bucket = storage.bucket(bucketName);
    const fileName = `${meetingId}-${Date.now()}.wav`;
    const file = bucket.file(fileName);

    // Upload audio to GCS
    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    await file.save(audioBuffer);

    // Get GCS URI
    const gcsUri = `gs://${bucketName}/${fileName}`;

    // Start transcription with GCS URI
    const [operation] = await speechClient.longRunningRecognize({
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
      ?.map((result: any) => result.alternatives?.[0]?.transcript)
      .join('\n');

    // Ensure transcriptions directory exists
    const transcriptionsDir = path.join(process.cwd(), 'transcriptions');
    await fs.mkdir(transcriptionsDir, { recursive: true });

    await fs.writeFile(
      path.join(transcriptionsDir, `${meetingId}.txt`),
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