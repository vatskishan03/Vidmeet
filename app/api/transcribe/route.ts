import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const meetingId = formData.get('meetingId') as string;

    // Write the uploaded audio to a local file
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const wavPath = path.join(uploadsDir, `${meetingId}.wav`);
    const arrayBuffer = await audio.arrayBuffer();
    const typedData = new Uint8Array(arrayBuffer);
    await fs.writeFile(wavPath, typedData);

    // Spawn the Python script to run faster-whisper
    const pythonProcess = spawn('python', ['transcribe.py', wavPath, meetingId]);

    return new Promise((resolve, reject) => {
      pythonProcess.stdout.on('data', (data) => {
        console.log('Transcription output:', data.toString());
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Transcription error:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ success: true }));
        } else {
          reject(
            NextResponse.json(
              { error: 'faster-whisper transcription failed' },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}