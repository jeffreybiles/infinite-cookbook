"use client"

import pizza from "@/icons/pizza.png"
import steak from "@/icons/steak.png"
import salad from "@/icons/salad.png"
import tacos from "@/icons/taco.png"

import Image from "next/image"
import { useState } from "react"
import DisplayRecipe from "./DisplayRecipe"

const postRequest = async (url: string, body: any) => {
    const response = await fetch(url, {
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
    const [recipes, setRecipes] = useState<string[]>([]);
    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const [updateRecipeMessage, setUpdateRecipeMessage] = useState<string>("");
    // should probably use a reusable function for making updates.  Then have accordions for each version of the recipe
    // why am I still doing frontend?  This is stupid.  I should be doing backend.  I should be doing backend.  I should be doing backend.
    // I will learn more by plunking around in python, calling various APIs, than worrying about frontend bullshit

    const generateRecipe = async (recipeName: string) => {
        try {
            setLoadingMessage('Generating recipe...');
            const response = await postRequest('http://localhost:8000/generate', { recipeRequest: recipeName });

            if (!response.ok) {
                throw new Error('Failed to generate recipe');
            }

            const data = await response.json();
            setRecipes([data.recipe]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingMessage('');
        }
    }

    const updateRecipe = async (recipe: string, preferences: string) => {
        try {
            setLoadingMessage('Updating recipe with your preferences...');
            const response = await postRequest('/api/update', { recipe: recipe, preferences: preferences });
            const data = await response.json();
            setRecipes([ data.updatedRecipe, ...recipes]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingMessage('');
        }
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <div>
              {recipes.length > 0 ? (
                <div className="flex flex-col gap-2 w-full">
                  <textarea placeholder="What changes would you like to make?" onChange={(e) => setUpdateRecipeMessage(e.target.value)} className="w-full p-2 rounded-md" />
                  <button onClick={() => updateRecipe(recipes[0], updateRecipeMessage)} className="w-full bg-blue-500 text-white p-2 rounded-md">Update</button>
                </div>
              ) : <div className="grid grid-cols-4 gap-2 mb-8">
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
              </div>}
            </div>
            {loadingMessage && <p>{loadingMessage}</p>}
            {recipes.map((recipe, index) => (
              <DisplayRecipe recipe={recipe} key={index} />
            ))}
        </div>
    );
}