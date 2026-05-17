import { NextRequest, NextResponse } from 'next/server';
import { MIN_FILE_CHARS } from '@/lib/config';

export const maxDuration = 30;

// Supported MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc (older)
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword' ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.name.toLowerCase().endsWith('.doc');

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

    if (!isDocx && !isPdf && !isTxt) {
      return NextResponse.json(
        { error: 'Only PDF, DOCX, and plain text (.txt) files are supported.' },
        { status: 400 }
      );
    }

    let extractedText = '';

    if (isTxt) {
      // Plain text — direct read
      extractedText = await file.text();

    } else if (isDocx) {
      // DOCX — use mammoth
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth') as {
        extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>;
      };
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;

    } else {
      // PDF — use pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // pdf-parse uses CommonJS exports — use require to avoid ESM type issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    }

    const cleaned = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleaned.length < MIN_FILE_CHARS) {
      return NextResponse.json(
        { error: 'Could not extract readable text from this file. Try pasting the text directly.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: cleaned, charCount: cleaned.length });
  } catch (error: unknown) {
    console.error('[LexGuard] File parse error:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse file.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
