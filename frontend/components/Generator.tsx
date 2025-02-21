"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { postRequest } from "@/utils/post-request"
import { getPreferences } from "@/utils/preferences"

export default function Generator({ is_custom_input }: { is_custom_input: boolean }) {
    const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);
    const [customDishDescription, setCustomDishDescription] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
      generateMoreIdeas();
    }, []);

    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const router = useRouter();

    const generateRecipe = async (recipeName: string) => {
      try {
        setLoadingMessage('Generating recipe...');
        setErrorMessage('');
        const options = getPreferences();
        const response = await postRequest('generate', { recipeRequest: recipeName, preferences: options });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to generate recipe');
        }
        setLoadingMessage('Recipe generated!  Sending it to you...');

        if (data.recipe.id) {
          router.push(`/recipe/${data.recipe.id}`);
          return;
        }
      } catch (error) {
        setErrorMessage('' + error);
      } finally {
        setLoadingMessage('');
      }
    }

    const generateMoreIdeas = async () => {
      const response = await fetch('http://localhost:8000/dish-ideas?current=' + generatedIdeas.join(','));
      const data = await response.json();
      setGeneratedIdeas([...generatedIdeas, ...data.dish_ideas]);
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {is_custom_input ? <div className="flex flex-col gap-2 w-full">
          <textarea className="border border-gray-300 p-2 rounded-md w-full" placeholder="Describe what you want to eat.  Feel free to go into detail or leave it vague." value={customDishDescription} onChange={(e) => setCustomDishDescription(e.target.value)} />
          <button className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50" onClick={() => generateRecipe(customDishDescription)} disabled={customDishDescription === ''}>Generate</button>
        </div> : <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-2">
            {generatedIdeas.map((idea) => (
              <div className="col-span-1" key={idea}>
              <button
                className="flex items-center justify-center border border-gray-300 p-2 rounded-md w-full h-full hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50 dark:hover:bg-gray-700"
                onClick={() => generateRecipe(idea)}
                disabled={loadingMessage !== ''}
              >
                {idea}
              </button>
              </div>
            ))}
          </div>
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => generateMoreIdeas()}>More ideas</button>
        </>}
        {loadingMessage && <p className="text-center">{loadingMessage}</p>}
        {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
      </div>
    );
}