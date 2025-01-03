"use client"

import { useEffect, useState } from "react"
import { Recipe } from "@/app/recipe"
import DisplayRecipe from "./DisplayRecipe"
import { useRouter } from "next/navigation"

const fetchRecipe = async (id: string) => {
  const res = await fetch(`http://localhost:8000/recipes/${id}`)
  const data = await res.json()
  return data
}

export default function LoadRecipe({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [children, setChildren] = useState<Recipe[]>([])
  const [parent, setParent] = useState<Recipe | null>(null)
  const [related, setRelated] = useState<Recipe[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchRecipe(id).then((data) => {
      setRecipe(data.recipe)
      setRelated(data.related)
      setParent(data.related.find((r: Recipe) => r.id === data.recipe.parent_id))
      setChildren(data.related.filter((r: Recipe) => r.parent_id === data.recipe.id))
    })
  }, [])

  return <div className="flex flex-col gap-4 pt-4">
    <div className="flex flex-row justify-between">
      {parent ? <button className="py-2" onClick={() => {
        router.push(`/recipe/${parent.id}`)
      }}>← Previous Version</button> : <div></div>}

      <div className="flex flex-col gap-2">
        {children.map((child) => <button key={child.id} className="py-2" onClick={() => {
          router.push(`/recipe/${child.id}`)
        }}>{child.prompt} →</button>)}
      </div>
    </div>
    {recipe ? <DisplayRecipe recipe={recipe.content} name={recipe.name || recipe.prompt} /> : <div></div>}
  </div>
}