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

  useEffect(() => {
    fetchRecipes().then(setRecipes);
  }, []);

  return <div className="flex flex-col gap-2">
    {recipes.map((recipe) => <div key={recipe.id}>
      <Link href={`/recipe/${recipe.id}`} className="hover:bg-gray-100 transition-colors duration-300 p-2 rounded-md">{recipe.name || recipe.prompt}</Link>
    </div>)}
  </div>
}