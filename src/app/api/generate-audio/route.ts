import { NextRequest, NextResponse } from 'next/server';

type SupportedLanguage = 'en' | 'hi' | 'te';

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  en: 'en',
  hi: 'hi',
  te: 'te',
};

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const langCode = LANGUAGE_CODES[language as SupportedLanguage] || 'en';

    // Clean the text
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[-*+]\s/g, '')
      .replace(/^\d+\.\s/gm, '')
      .replace(/>\s/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Split into chunks (Google TTS limit is ~200 chars per request)
    const chunks = splitTextIntoChunks(cleanedText, 180);
    
    // Fetch audio for each chunk
    const audioBuffers: ArrayBuffer[] = [];
    
    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      
      // Use Google Translate TTS with the specified language
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodedText}`;
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/',
          },
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          audioBuffers.push(buffer);
        }
      } catch (e) {
        console.warn('Chunk fetch failed:', e);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (audioBuffers.length === 0) {
      // Fallback: Try StreamElements API (English only)
      if (langCode === 'en') {
        const fallbackChunks = splitTextIntoChunks(cleanedText, 200);
        
        for (const chunk of fallbackChunks.slice(0, 5)) {
          try {
            const response = await fetch(
              `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(chunk)}`
            );
            
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              audioBuffers.push(buffer);
            }
          } catch (e) {
            console.warn('StreamElements chunk failed:', e);
          }
          
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 });
    }

    // Combine all audio buffers
    const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const buffer of audioBuffers) {
      combinedBuffer.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    // Return as audio file
    return new NextResponse(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'attachment; filename="audio.mp3"',
        'Content-Length': String(combinedBuffer.length),
      },
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if (sentence.length > maxLength) {
      // If single sentence is too long, split by words
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      const words = sentence.split(' ');
      let wordChunk = '';
      
      for (const word of words) {
        if ((wordChunk + ' ' + word).length <= maxLength) {
          wordChunk = wordChunk ? wordChunk + ' ' + word : word;
        } else {
          if (wordChunk) chunks.push(wordChunk.trim());
          wordChunk = word;
        }
      }
      
      if (wordChunk) {
        currentChunk = wordChunk;
      }
    } else if ((currentChunk + ' ' + sentence).length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(c => c.length > 0);
}
