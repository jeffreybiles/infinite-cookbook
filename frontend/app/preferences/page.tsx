"use client"

import { useState, useEffect } from "react"
import { Options, avoidOptions, spiceLevels, lifestyleOptions, localStorageKey } from "@/utils/preferences"

export default function Preferences() {
  const [options, setOptions] = useState<Options>({ avoid: [], lifestyle: [], spiceLevel: null, custom: "" })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(localStorageKey)
      if (saved) {
        setOptions(JSON.parse(saved))
      }
    }
  }, [])

  const savePreferences = (newOptions: Options) => {
    setOptions(newOptions)
    localStorage.setItem(localStorageKey, JSON.stringify(newOptions))
  }

  const updateAvoidList = (item: string) => {
    const avoidList = options.avoid.includes(item) ? options.avoid.filter((i) => i !== item) : [...options.avoid, item]
    const newOptions = { ...options, avoid: avoidList }
    savePreferences(newOptions)
  }

  const updateLifestyleList = (item: string) => {
    const lifestyleList = options.lifestyle.includes(item) ? options.lifestyle.filter((i) => i !== item) : [...options.lifestyle, item]
    const newOptions = { ...options, lifestyle: lifestyleList }
    savePreferences(newOptions)
  }

  const updateSpiceLevel = (level: string) => {
    const newLevel = options.spiceLevel == level ? null : level
    const newOptions = { ...options, spiceLevel: newLevel }
    savePreferences(newOptions)
  }

  const updateCustom = (custom: string) => {
    const newOptions = { ...options, custom: custom }
    savePreferences(newOptions)
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
