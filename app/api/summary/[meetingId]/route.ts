import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

// Force Node.js runtime
export const runtime = 'nodejs';
// Add dynamic config
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    const transcriptionPath = path.join(
      process.cwd(),
      'transcriptions',
      `${params.meetingId}.txt`
    );

    // Check if transcription file exists
    try {
      await fs.access(transcriptionPath);
    } catch {
      return NextResponse.json(
        { error: 'No transcription found for this meeting' },
        { status: 404 }
      );
    }

    // Read transcription file
    const transcription = await fs.readFile(transcriptionPath, 'utf-8');

    // Use Python script for summarization
    try {
      const pythonProcess = spawn('python', ['summary.py']);
      await fs.writeFile('transcription.txt', transcription);

      return new Promise((resolve) => {
        let summaryData = '';

        pythonProcess.stdout.on('data', (data) => {
          summaryData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            resolve(NextResponse.json(
              { error: 'Failed to generate summary' },
              { status: 500 }
            ));
            return;
          }

          resolve(NextResponse.json({ 
            summary: summaryData.trim() || 'No summary available'
          }));
        });
      });
    } catch (error) {
      console.error('Python execution error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}