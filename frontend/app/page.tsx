import Scraper from "@/components/Scraper";
import Generator from "../components/Generator";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold mb-0 pb-0">Infinite Cookbook</h1>
      <p className="text-lg mt-0 pt-0">As many recipes as you want, completely customizable</p>
      <div className="grid grid-cols-1 md:grid-cols-2 justify-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-left w-full">Customize an existing recipe</h2>
          <Scraper />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-left w-full">Or describe what you want to eat</h2>
          <Generator is_custom_input={true} />
        </div>
        <div className="flex flex-col gap-4 md:col-span-2">
          <h2 className="text-2xl font-bold text-left w-full">Or try one of these tasty ideas</h2>
          <Generator is_custom_input={false} />
        </div>
      </div>
    </div>
  );
}
