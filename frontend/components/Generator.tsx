"use client"

import pizza from "@/icons/pizza.png"
import steak from "@/icons/steak.png"
import salad from "@/icons/salad.png"
import tacos from "@/icons/taco.png"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

const postRequest = async (url: string, body: any) => {
    const fullUrl = `http://localhost:8000/${url}`
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    return response;
}

export default function Generator() {
    const recipeTypes = [{name: "Pizza", icon: pizza}, {name: "Steak", icon: steak}, {name: "Salad", icon: salad}, {name: "Tacos", icon: tacos}]
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const router = useRouter();

    const generateRecipe = async (recipeName: string) => {
        try {
            setLoadingMessage('Generating recipe...');
            const response = await postRequest('generate', { recipeRequest: recipeName });

            if (!response.ok) {
                throw new Error('Failed to generate recipe');
            }
            setLoadingMessage('Recipe generated!  Sending it to you...');

            const data = await response.json();
            if (data.recipe.id) {
                router.push(`/recipe/${data.recipe.id}`);
                return;
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingMessage('');
        }
    }

    const updateRecipe = async (recipe: string, preferences: string) => {
        try {
            setLoadingMessage('Updating recipe with your preferences...');
            const response = await postRequest('update', { recipe: recipe, preferences: preferences });
            const data = await response.json();
            // setRecipe(data.updatedRecipe);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingMessage('');
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-4 gap-2 mb-8">
                {recipeTypes.map((recipeType) => (
                  <div className="col-span-1" key={recipeType.name}>
                    <button
                      className="flex items-center justify-center"
                      onClick={() => generateRecipe(recipeType.name)}
                      disabled={loadingMessage !== ''}
                    >
                      <Image src={recipeType.icon} alt={recipeType.name} width={100} height={100} />
                    </button>
                  </div>
                ))}
            </div>
            {loadingMessage && <p>{loadingMessage}</p>}
        </div>
    );
}