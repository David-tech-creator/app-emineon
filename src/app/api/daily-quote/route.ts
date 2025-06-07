import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface DailyQuote {
  text: string;
  author: string;
  date: string;
}

// Cache quotes to avoid regenerating the same quote multiple times per day
const quoteCache = new Map<string, DailyQuote>();

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toDateString();
    
    // Check cache first
    if (quoteCache.has(today)) {
      return NextResponse.json(quoteCache.get(today));
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize OpenAI client inside the function
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `Generate a single inspirational quote (max 150 characters) for recruitment professionals, HR leaders, or business executives. The quote should be about:
    - Leadership and talent management
    - Business success and growth
    - Innovation and strategy
    - Team building and culture
    - Professional development
    - Overcoming challenges
    
    Provide ONLY a JSON response in this exact format:
    {
      "text": "The actual quote text without quotes",
      "author": "A real historical figure, business leader, or well-known professional (not fictional)"
    }
    
    Make it motivational and relevant to professionals in talent acquisition and business leadership.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional quote curator specializing in business leadership and talent management inspiration. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsedQuote = JSON.parse(responseText);
    
    const quote: DailyQuote = {
      text: parsedQuote.text,
      author: parsedQuote.author,
      date: today
    };

    // Cache the quote
    quoteCache.set(today, quote);

    // Clean up old cache entries (keep only today's)
    const keysToDelete = Array.from(quoteCache.keys()).filter(date => date !== today);
    keysToDelete.forEach(date => quoteCache.delete(date));

    return NextResponse.json(quote);

  } catch (error) {
    console.error('Error generating daily quote:', error);
    
    // Return a fallback quote based on the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const fallbackQuotes = [
      {
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill"
      },
      {
        text: "Your network is your net worth.",
        author: "Porter Gale"
      },
      {
        text: "Talent wins games, but teamwork and intelligence win championships.",
        author: "Michael Jordan"
      },
      {
        text: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs"
      },
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney"
      },
      {
        text: "Excellence is never an accident. It is always the result of high intention.",
        author: "Aristotle"
      }
    ];

    const fallbackQuote = fallbackQuotes[dayOfYear % fallbackQuotes.length];
    
    return NextResponse.json({
      text: fallbackQuote.text,
      author: fallbackQuote.author,
      date: new Date().toDateString()
    });
  }
} 