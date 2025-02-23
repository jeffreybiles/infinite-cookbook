import Generator from "../components/Generator";
import Link from "next/link";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold mb-0 pb-0">Infinite Cookbook</h1>
      <p className="text-lg m-0 p-0">As many recipes as you want, completely customizable</p>

      <div className="justify-center gap-4 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold text-left w-full">Describe what you want to eat</h2>
          <Generator is_custom_input={true} />
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-left w-full">Or try one of these tasty ideas</h2>
          <Generator is_custom_input={false} />
        </div>
      </div>
    </div>
  );
}
