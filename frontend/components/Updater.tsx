"use client"

import { postRequest } from "@/utils/post-request";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Updater({ recipe_id }: { recipe_id: string }) {
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [preferences, setPreferences] = useState<string>("");
  const router = useRouter();

  const updateRecipe = async () => {
      try {
          setLoadingMessage('Updating recipe with your preferences...');
          const response = await postRequest('update', { recipe_id: recipe_id, preferences: preferences });
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
  </div>
}