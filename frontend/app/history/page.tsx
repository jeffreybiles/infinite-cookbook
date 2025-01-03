import RecipeList from "@/components/RecipeList";

export default function History() {
  return <main className="container mx-auto p-4">
    <h1 className="text-2xl font-bold">Previous Recipes</h1>
    <RecipeList />
  </main>
}