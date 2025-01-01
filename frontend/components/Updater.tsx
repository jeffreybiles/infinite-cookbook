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
  const [preferences, setPreferences] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const router = useRouter();

useEffect(() => {
    fetch(`http://localhost:8000/recipe/${recipe_id}/suggestions`)
      .then(response => response.json())
      .then(data => {
        const sgg = JSON.parse(data.suggestions);
        console.log(sgg);
        setSuggestions(sgg.suggestions);
      });
  }, [recipe_id]);

  const updateRecipe = async (change?: string) => {
      try {
          setLoadingMessage('Updating recipe with your preferences...');
          const changes = change ? change : preferences;
          const response = await postRequest('update', { recipe_id: recipe_id, preferences: changes });
          const data = await response.json();
          setLoadingMessage('Recipe updated!  Redirecting...');
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

  return <div className="flex flex-col gap-2 w-full">
    <input type="text" placeholder="What would you like to change?" onChange={(e) => setPreferences(e.target.value)} className="border border-gray-300 p-2 rounded-md" />
    <button onClick={() => updateRecipe()} className="bg-blue-500 text-white p-2 rounded-md">Update</button>
    {loadingMessage && <p>{loadingMessage}</p>}
    {suggestions && <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
      {suggestions.map((suggestion: Suggestion) => {
        return <button
          key={suggestion.change}
          className="flex flex-col p-3 border border-gray-300 rounded-md text-left hover:bg-gray-100 transition-colors duration-300"
          onClick={() => {
            updateRecipe(suggestion.change);
          }}
        >
          <h4 className="text-lg font-bold mb-2 mt-0">{suggestion.change}</h4>
          <p className="text-sm mb-0">{suggestion.explanation}</p>
        </button>
      })}
    </div>}
  </div>
}