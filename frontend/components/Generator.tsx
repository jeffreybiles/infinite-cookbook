"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { postRequest } from "@/utils/post-request"

export default function Generator() {
    const [chosenRecipeTypes, setChosenRecipeTypes] = useState<string[]>([]);
    const [showCustomDishDescription, setShowCustomDishDescription] = useState<boolean>(false);
    const [customDishDescription, setCustomDishDescription] = useState<string>("");
    const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
      generateMoreIdeas();
    }, []);

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

    const generateMoreIdeas = async () => {
      const response = await fetch('http://localhost:8000/dish-ideas?current=' + chosenRecipeTypes.join(','));
      const data = await response.json();
      setChosenRecipeTypes([...chosenRecipeTypes, ...data.dish_ideas]);
    }

    const scrapeFromUrl = async (url: string) => {
      const response = await fetch('http://localhost:8000/scrape?url=' + url);
      const data = await response.json();
      if (data.recipe.id) {
        router.push(`/recipe/${data.recipe.id}`);
        return;
      }
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {showCustomDishDescription ? <div className="flex flex-col gap-2 w-full">
          <textarea className="border border-gray-300 p-2 rounded-md w-full" placeholder="Describe what you want to eat.  Feel free to go into detail or leave it vague." value={customDishDescription} onChange={(e) => setCustomDishDescription(e.target.value)} />
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => generateRecipe(customDishDescription)}>Generate</button>
        </div> : showUrlInput ? <div className="flex flex-col gap-2 w-full">
          <input className="border border-gray-300 p-2 rounded-md w-full" placeholder="Enter the URL of the recipe you want to generate" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => scrapeFromUrl(url)}>Scrape from URL</button>
        </div> : <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-2">
            {chosenRecipeTypes.map((recipeType) => (
              <div className="col-span-1" key={recipeType}>
              <button
                className="flex items-center justify-center border border-gray-300 p-2 rounded-md w-full h-full hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 dark:hover:bg-gray-700"
                onClick={() => generateRecipe(recipeType)}
                disabled={loadingMessage !== ''}
              >
                {recipeType}
              </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => generateMoreIdeas()}>More ideas</button>
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => setShowCustomDishDescription(true)}>Describe what you want to eat</button>
            <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => setShowUrlInput(true)}>Get recipe from URL</button>

          </div>
        </>}
        {loadingMessage && <p className="text-center">{loadingMessage}</p>}
      </div>
    );
}