"use client"

import { useState } from "react"

const avoidOptions = ["peanuts", "gluten", "dairy", "eggs", "fish", "shellfish", "soy", "tree nuts", "alcohol", "caffeine", "sugar", "salt", "artificial sweeteners"]
// const likeList = ["spicy", "sweet", "salty", "sour", "bitter", "umami"]
const spiceLevels = ["mild", "medium", "hot", "very hot"]
const lifestyleOptions = ["vegan", "vegetarian", "halal", "kosher", "paleo", "keto", "low-carb", "low-fat"]

export default function Preferences() {
  const [options, setOptions] = useState<{ avoid: string[], lifestyle: string[], spiceLevel: string | null, custom: string }>({ avoid: [], lifestyle: [], spiceLevel: null, custom: "" })

  const updateAvoidList = (item: string) => {
    const avoidList = options.avoid.includes(item) ? options.avoid.filter((i) => i !== item) : [...options.avoid, item]
    setOptions({ ...options, avoid: avoidList })
  }

  const updateLifestyleList = (item: string) => {
    const lifestyleList = options.lifestyle.includes(item) ? options.lifestyle.filter((i) => i !== item) : [...options.lifestyle, item]
    setOptions({ ...options, lifestyle: lifestyleList })
  }

  const updateSpiceLevel = (level: string) => {
    const newLevel = options.spiceLevel == level ? null : level
    setOptions({ ...options, spiceLevel: newLevel })
  }

  const updateCustom = (custom: string) => {
    setOptions({ ...options, custom: custom })
  }

  return <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold">Preferences</h1>
    <div className="flex flex-row gap-8">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold mt-4">Avoid</h2>
        <div className="flex flex-col">
          {avoidOptions.map((item) => <div key={item} className="flex flex-row gap-2">
            <input type="checkbox" id={item} checked={options.avoid.includes(item)} onChange={() => updateAvoidList(item)} />
            <label htmlFor={item}>{item}</label>
          </div>)}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Lifestyle</h2>
        <div className="flex flex-col">
          {lifestyleOptions.map((item) => <div key={item} className="flex flex-row gap-2">
            <input type="checkbox" id={item} checked={options.lifestyle.includes(item)} onChange={() => updateLifestyleList(item)} />
            <label htmlFor={item}>{item}</label>
          </div>)}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Spice Level</h2>
        <div className="flex flex-col">
          {spiceLevels.map((level) =>
            <div key={level} className="flex flex-row gap-2 items-center cursor-pointer" onClick={() => updateSpiceLevel(level)}>
              <div className={`w-4 h-4 rounded-full border border-gray-300 ${options.spiceLevel === level ? 'bg-blue-500' : 'bg-white'}`} />
              <div>{level}</div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">Custom Instructions</h2>
        <textarea value={options.custom} onChange={(e) => updateCustom(e.target.value)} className="w-full h-32 border border-gray-300 rounded-md p-2" />
      </div>
    </div>
  </div>
}
