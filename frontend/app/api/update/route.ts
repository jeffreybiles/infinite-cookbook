import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { recipe, preferences } = await request.json();
  const updatedRecipe = await openai.chat.completions.create({
    messages: [{ role: 'user', content: `Update the recipe for ${recipe} to include the following preferences: ${preferences}` }],
    model: 'gpt-4o',
  });
  return NextResponse.json({ updatedRecipe: updatedRecipe.choices[0].message.content });
}