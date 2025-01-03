"use client"

import { postRequest } from "@/utils/post-request";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Suggestion = {
  change: string;
  explanation: string;
}

export default function Updater({ recipe_id }: { recipe_id: string }) {
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [preferences, setPreferences] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showCustomSuggestion, setShowCustomSuggestion] = useState<boolean>(false);
  const router = useRouter();

  const loadSuggestions = async () => {
    const response = await fetch(`http://localhost:8000/recipe/${recipe_id}/suggestions?previous=${suggestions.map(s => s.change).join(',')}`);
    const data = await response.json();
    setSuggestions([...suggestions, ...data.suggestions]);
  }

useEffect(() => {
    loadSuggestions();
  }, [recipe_id]);

  const updateRecipe = async (change?: string) => {
      try {
          setLoadingMessage('Updating recipe with your preferences...');
          setErrorMessage('');
          const changes = change ? change : preferences;
          const response = await postRequest('update', { recipe_id: recipe_id, preferences: changes });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.detail || 'Failed to update recipe');
          }
          setLoadingMessage('Recipe updated!  Redirecting...');
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

  return <div className="flex flex-col gap-2 w-full">
    {loadingMessage && <p className="text-center">{loadingMessage}</p>}
    {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
    {showCustomSuggestion ?
      <div className="flex flex-col gap-2 w-full">
        <textarea placeholder="What would you like to change?  Type as much as you want." onChange={(e) => setPreferences(e.target.value)} className="border border-gray-300 p-2 rounded-md" />
        <button onClick={() => updateRecipe()} className="bg-blue-500 text-white p-2 rounded-md">Update</button>
      </div>
      :
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {suggestions && suggestions.map((suggestion: Suggestion) => {
            return <button
              key={suggestion.change}
              className="flex flex-col p-3 border border-gray-300 rounded-md text-left hover:bg-gray-100 transition-colors duration-300 dark:hover:bg-gray-700"
              onClick={() => {
                updateRecipe(suggestion.change);
              }}
            >
              <h4 className="text-lg font-bold mb-2 mt-0">{suggestion.change}</h4>
              <p className="text-sm mb-0">{suggestion.explanation}</p>
            </button>
          })}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => loadSuggestions()} className="bg-blue-500 text-white p-2 rounded-md">More suggestions</button>
          <button onClick={() => setShowCustomSuggestion(true)} className="bg-blue-500 text-white p-2 rounded-md">Custom suggestion</button>
        </div>
      </>
    }
  </div>
}