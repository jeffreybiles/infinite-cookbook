import Generator from "../components/Generator";
import RecipeList from "../components/RecipeList";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold mb-0 pb-0">Infinite Cookbook</h1>
        <p className="text-lg mt-0 pt-0">As many recipes as you want, completely customizable</p>
        <Generator />
        <h1 className="text-4xl font-bold mt-8 pt-8">Previous Recipes</h1>
        <RecipeList />
      </div>
    </div>
  );
}
