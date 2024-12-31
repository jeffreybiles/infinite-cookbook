"use client"

import pizza from "@/icons/pizza.png"
import steak from "@/icons/steak.png"
import salad from "@/icons/salad.png"
import tacos from "@/icons/taco.png"

import Image from "next/image"
import { useState } from "react"

export default function Generator() {
    const suggestions = [{name: "Pizza", icon: pizza}, {name: "Steak", icon: steak}, {name: "Salad", icon: salad}, {name: "Tacos", icon: tacos}]
    const [recipe, setRecipe] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const generateRecipe = async (recipeName: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipe: recipeName }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate recipe');
            }

            const data = await response.json();
            setRecipe(data.recipe);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="grid grid-cols-4 gap-4 mb-8">
                {suggestions.map((suggestion) => (
                    <div className="col-span-1" key={suggestion.name}>
                        <button
                            className="flex items-center justify-center"
                            onClick={() => generateRecipe(suggestion.name)}
                            disabled={loading}
                        >
                            <Image src={suggestion.icon} alt={suggestion.name} width={100} height={100} />
                        </button>
                    </div>
                ))}
            </div>
            {loading && <p>Generating recipe...</p>}
            {recipe && (
                <div className="whitespace-pre-wrap">
                    {recipe}
                </div>
            )}
        </div>
    );
}