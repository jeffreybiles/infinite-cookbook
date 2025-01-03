import Generator from "../components/Generator";

export default function Home() {
  return (
    <div className="items-center justify-items-center p-8 pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold mb-0 pb-0">Infinite Cookbook</h1>
        <p className="text-lg mt-0 pt-0">As many recipes as you want, completely customizable</p>
        <Generator />
      </div>
    </div>
  );
}
