import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { recipe } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful chef who provides recipes."
        },
        {
          role: "user",
          content: `Generate a recipe for ${recipe}. Include ingredients and steps.`
        }
      ],
      model: "gpt-4o",
    });

    return NextResponse.json({
      recipe: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}