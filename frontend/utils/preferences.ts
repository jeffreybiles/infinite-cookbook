export type Options = { avoid: string[], lifestyle: string[], spiceLevel: string | null, custom: string }

export const avoidOptions = ["peanuts", "gluten", "dairy", "eggs", "fish", "shellfish", "seed oils","soy", "tree nuts", "alcohol", "caffeine", "sugar", "salt", "artificial sweeteners"]
export const spiceLevels = ["mild", "medium", "hot", "very hot"]
export const lifestyleOptions = ["vegan", "vegetarian", "halal", "kosher", "paleo", "keto", "low-carb", "low-fat"]

export const localStorageKey = "userPreferences"

export const getPreferences = (): Options => {
    const saved = localStorage.getItem(localStorageKey)
    if (saved) {
        return JSON.parse(saved)
    }
    return { avoid: [], lifestyle: [], spiceLevel: null, custom: "" }
}
