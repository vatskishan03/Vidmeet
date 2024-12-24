import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Force Node.js runtime
export const runtime = 'nodejs';
// Add dynamic config
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { meetingId: string } }
) {
  try {
    // Read transcription
    const transcriptionPath = path.join(
      process.cwd(), 
      'transcriptions', 
      `${params.meetingId}.txt`
    );
    
    const transcription = await fs.readFile(transcriptionPath, 'utf-8');

    // Use regular expressions to summarize instead of transformers
    // This is a simpler alternative that doesn't require external dependencies
    const sentences = transcription.split(/[.!?]+/);
    const summary = sentences
      .filter((s, i) => i % 3 === 0) // Take every third sentence
      .join('. ');

    return NextResponse.json({ 
      summary: summary || 'No summary available' 
    });

  } catch (error) {
    console.error('Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}