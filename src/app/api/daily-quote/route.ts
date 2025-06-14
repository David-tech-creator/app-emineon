import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Collection of inspirational quotes for recruitment professionals
    const quotes = [
      {
        text: "Great companies are built by great people, and great people are found by great recruiters.",
        author: "Anonymous",
        category: "recruitment"
      },
      {
        text: "Talent wins games, but teamwork and intelligence win championships.",
        author: "Michael Jordan",
        category: "teamwork"
      },
      {
        text: "The best way to predict the future is to create it by hiring the right people.",
        author: "Peter Drucker (adapted)",
        category: "hiring"
      },
      {
        text: "In the end, it's not about finding a job, it's about finding the right fit.",
        author: "Anonymous",
        category: "matching"
      },
      {
        text: "Every person you hire either helps or hurts your company culture.",
        author: "Tony Hsieh",
        category: "culture"
      },
      {
        text: "Recruiting is not about filling positions, it's about building futures.",
        author: "Anonymous",
        category: "purpose"
      },
      {
        text: "The art of recruitment is finding extraordinary people hiding in ordinary places.",
        author: "Anonymous",
        category: "discovery"
      },
      {
        text: "A-players hire A-players. B-players hire C-players.",
        author: "Steve Jobs",
        category: "excellence"
      },
      {
        text: "Your network is your net worth, especially in recruitment.",
        author: "Porter Gale (adapted)",
        category: "networking"
      },
      {
        text: "The right person in the right role can change everything.",
        author: "Anonymous",
        category: "impact"
      }
    ];

    // Get today's date to ensure same quote for the day
    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % quotes.length;
    
    const dailyQuote = quotes[quoteIndex];

    // Add some recruitment tips based on the day
    const tips = [
      "Focus on candidate experience - every interaction matters",
      "Use data-driven insights to improve your hiring process",
      "Build relationships before you need them",
      "Personalize your outreach for better response rates",
      "Always follow up, but respect boundaries",
      "Quality over quantity in candidate sourcing",
      "Embrace technology, but don't lose the human touch"
    ];
    
    const tipIndex = (dayOfYear + 3) % tips.length;

    return NextResponse.json({
      success: true,
      data: {
        quote: {
          text: dailyQuote.text,
          author: dailyQuote.author,
          category: dailyQuote.category
        },
        tip: tips[tipIndex],
        date: today.toISOString().split('T')[0],
        message: "Stay motivated and keep building great teams!"
      },
      message: "Daily quote retrieved successfully"
    });

  } catch (error) {
    console.error('Daily quote API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch daily quote',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
} 