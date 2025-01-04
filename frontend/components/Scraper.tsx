"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getPreferences } from "@/utils/preferences";
import { postRequest } from "@/utils/post-request";

export default function Scraper() {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const router = useRouter();

  const scrapeFromUrl = async (url: string) => {
    setLoadingMessage('Scraping recipe...');
    setErrorMessage('');
    const preferences = getPreferences();
    const response = await postRequest(`scrape`, {
      preferences: preferences,
      url: url
    });
    const data = await response.json();
    setLoadingMessage('');
    if (data.recipe?.id) {
      router.push(`/recipe/${data.recipe.id}`);
      return;
    }
    setErrorMessage(data.detail || 'Failed to scrape recipe');
  }
  return <div className="flex flex-col gap-2 w-full">
    <textarea
      className="border border-gray-300 p-2 rounded-md w-full"
      placeholder="Found a good recipe somewhere else? Enter the URL and we can start customizing it!"
      value={url} onChange={(e) => setUrl(e.target.value)}
    />
    <button className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50" onClick={() => scrapeFromUrl(url)} disabled={!url}>Customize this recipe</button>
    {loadingMessage && <p className="text-center">{loadingMessage}</p>}
    {errorMessage && <p className="text-center text-red-500">{errorMessage}</p>}
  </div>
}