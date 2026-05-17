import { NextRequest, NextResponse } from 'next/server';
import { analyzeContract } from '@/lib/gemini';
import { Persona, Jurisdiction } from '@/lib/types';
import { MIN_CONTRACT_CHARS } from '@/lib/config';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractText, persona, jurisdiction } = body as {
      contractText: string;
      persona: Persona;
      jurisdiction: Jurisdiction;
    };

    if (!contractText || contractText.trim().length < MIN_CONTRACT_CHARS) {
      return NextResponse.json(
        { error: `Please provide a contract with at least ${MIN_CONTRACT_CHARS} characters.` },
        { status: 400 }
      );
    }

    // Key validation is handled inside analyzeContract() via validateProviderKey()
    const result = await analyzeContract(contractText, persona, jurisdiction);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[LexGuard] Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
