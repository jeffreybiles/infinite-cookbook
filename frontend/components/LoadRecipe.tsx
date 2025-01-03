"use client"

import { useEffect, useState } from "react"
import { Recipe } from "@/app/recipe"
import DisplayRecipe from "./DisplayRecipe"
import Link from "next/link"

const fetchRecipe = async (id: string) => {
  const res = await fetch(`http://localhost:8000/recipes/${id}`)
  const data = await res.json()
  return data
}

export default function LoadRecipe({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [related, setRelated] = useState<Recipe[]>([])

  useEffect(() => {
    fetchRecipe(id).then((data) => {
      setRecipe(data.recipe)
      setRelated(data.related)
    })
  }, [id])

  return <div className="flex flex-col gap-4 pt-4">
    {/* Maybe put the related recipes on a sidebar? */}
    <h2 className="text-2xl font-bold">Related Recipes</h2>
    <div className="flex flex-col gap-2">
      {related.map((r) => <div key={r.id}>
          <Link
            href={`/recipe/${r.id}`}
            className={`hover:bg-gray-100 transition-colors duration-300 p-2 rounded-md dark:hover:bg-gray-700 ${r.id === recipe?.id ? "bg-gray-200 dark:bg-gray-800" : ""}`}
            title={`Prompt: ${r.prompt}`}
          >
            {r.name || r.prompt}
          </Link>
      </div>)}
    </div>
    {recipe ? <DisplayRecipe recipe={recipe.content} name={recipe.name || recipe.prompt} /> : <div></div>}
  </div>
}