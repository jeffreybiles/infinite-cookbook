import Scraper from "@/components/Scraper";
import Generator from "../components/Generator";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold mb-0 pb-0">Infinite Cookbook</h1>
        <p className="text-lg mt-0 pt-0">As many recipes as you want, completely customizable</p>
        <h2 className="text-2xl font-bold text-left w-full">Customize an existing recipe</h2>
        <Scraper />
        <h2 className="text-2xl font-bold text-left w-full">Or describe what you want to eat</h2>
        <Generator is_custom_input={true} />
        <h2 className="text-2xl font-bold text-left w-full">Or try one of these tasty ideas</h2>
        <Generator is_custom_input={false} />
      </div>
    </div>
  );
}
