import Generator from "./Generator";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">Infinite Cookbook</h1>
        <p className="text-lg">The cookbook that learns what you love and never stops giving you new recipes</p>
        <Generator />
      </div>
    </div>
  );
}
