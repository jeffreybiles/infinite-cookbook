"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPreferences } from "@/utils/preferences";
import { postRequest } from "@/utils/post-request";

export default function Scraper() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  const scrapeFromUrl = async (url: string) => {
    const preferences = getPreferences();
    const response = await postRequest(`scrape`, {
      preferences: preferences,
      url: url
    });
    const data = await response.json();
    if (data.recipe.id) {
      router.push(`/recipe/${data.recipe.id}`);
      return;
    }
  }
  return <div className="flex flex-col gap-2 w-full">
    <textarea
      className="border border-gray-300 p-2 rounded-md w-full"
      placeholder="Found a good recipe somewhere else? Enter the URL and we can start customizing it!"
      value={url} onChange={(e) => setUrl(e.target.value)}
    />
    <button className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50" onClick={() => scrapeFromUrl(url)} disabled={!url}>Customize this recipe</button>
  </div>
}