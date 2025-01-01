"use client"

import { useEffect, useState } from "react"
import { Recipe } from "@/app/recipe"
import DisplayRecipe from "./DisplayRecipe"

const fetchRecipe = async (id: string) => {
  const res = await fetch(`http://localhost:8000/recipes/${id}`)
  const data = await res.json()
  return data.recipe
}

export default function LoadRecipe({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  useEffect(() => {
    fetchRecipe(id).then(setRecipe)
  }, [id])
  return <div>
    {recipe ? <DisplayRecipe recipe={recipe.content} /> : "Loading..."}
  </div>
}