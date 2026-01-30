import { NextRequest, NextResponse } from 'next/server';

type SupportedLanguage = 'en' | 'hi' | 'te';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!targetLanguage || !LANGUAGE_NAMES[targetLanguage as SupportedLanguage]) {
      return NextResponse.json({ error: 'Valid target language is required' }, { status: 400 });
    }

    // If already English and target is English, return as is
    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedText: text });
    }

    // Use Google Translate API (unofficial but works for short texts)
    const translatedText = await translateText(text, targetLanguage as SupportedLanguage);
    
    return NextResponse.json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function translateText(text: string, targetLang: SupportedLanguage): Promise<string> {
  // Split text into chunks to handle long texts (Google Translate has limits)
  const chunks = splitIntoChunks(text, 4500);
  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    try {
      // Use Google Translate API
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract translated text from response
      // Response format: [[["translated text","original text",null,null,10],...],null,"en",...]
      if (data && Array.isArray(data[0])) {
        const translated = data[0]
          .filter((item: unknown[]) => item && item[0])
          .map((item: unknown[]) => item[0])
          .join('');
        translatedChunks.push(translated);
      } else {
        translatedChunks.push(chunk); // Keep original if translation fails
      }

      // Small delay between chunks to avoid rate limiting
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.warn('Chunk translation failed:', error);
      translatedChunks.push(chunk); // Keep original on error
    }
  }

  return translatedChunks.join(' ');
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?।])\s+/);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + ' ' + sentence).length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      
      // If single sentence is too long, split by words
      if (sentence.length > maxLength) {
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
        currentChunk = wordChunk;
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks.filter(c => c.length > 0);
}
