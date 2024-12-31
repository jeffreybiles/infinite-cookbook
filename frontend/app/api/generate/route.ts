import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { recipeRequest, preferences } = await request.json();

    const recipeCompletion = await openai.chat.completions.create({
      messages: [
        { role: "user", content: `Generate a recipe for ${recipeRequest}. Include ingredients and steps.` }
      ],
      model: "gpt-4o",
    });

    const recipe = recipeCompletion.choices[0].message.content;

    return NextResponse.json({
      recipe: recipe
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}