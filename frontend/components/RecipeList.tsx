"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import { Recipe } from "../app/recipe";

const fetchRecipes = async () => {
  const response = await fetch("http://localhost:8000/recipes");
  const data = await response.json();
  return data['recipes'].sort((a: Recipe, b: Recipe) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groupedRecipes, setGroupedRecipes] = useState<[string, Recipe[]][]>([]);

  useEffect(() => {
    fetchRecipes().then(setRecipes);
  }, []);
  useEffect(() => {
    const groupedRecipes = recipes.reduce((acc: { [key: string]: Recipe[] }, recipe) => {
      acc[recipe.original_id] = [...(acc[recipe.original_id] || []), recipe];
      return acc;
    }, {});
    const sortedGroupedRecipes = Object.entries(groupedRecipes).sort((a: [string, Recipe[]], b: [string, Recipe[]]) => new Date(b[1][0].created_at).getTime() - new Date(a[1][0].created_at).getTime())
    setGroupedRecipes(sortedGroupedRecipes);
  }, [recipes]);

  return <div className="flex flex-col gap-2">
    {groupedRecipes.map(([original_id, recipes]) =>
      <div key={original_id} className="border border-gray-200 p-2 flex flex-row gap-2">
        <div className="text-lg font-bold">{original_id}</div>
        <div className="flex flex-col gap-2">
          {recipes.map((recipe) => <div key={recipe.id}>
            <Link
              href={`/recipe/${recipe.id}`}
              className="hover:bg-gray-100 transition-colors duration-300 p-2 rounded-md dark:hover:bg-gray-700"
            >
              {recipe.name || recipe.prompt}
            </Link>
          </div>)}
        </div>
      </div>
    )}
  </div>
}