"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { postRequest } from "@/utils/post-request"

const recipeTypes = [
    "Pad Thai",
    "Fish and Chips",
    "Chicken Fettuccine",
    "Beef Tacos",
    "Vegetable Curry",
    "Sushi Rolls",
    "Chicken Tikka Masala",
    "Meatball Subs",
    "Grilled Steak",
    "Lobster Bisque",
    "Quesadillas",
    "Chicken Souvlaki",
    "Shrimp Scampi",
    "Eggplant Parmesan",
    "Jambalaya",
    "Falafel Wrap",
    "Chicken Parmesan",
    "Banana Pancakes",
    "Breakfast Burrito",
    "Lasagna",
    "Chicken Quesadilla",
    "Beef and Broccoli",
    "Pho",
    "Chicken Tenders",
    "Meatloaf",
    "Mashed Potatoes",
    "Ramen",
    "Grilled Cheese",
    "Chicken Caesar",
    "Turkey Club",
    "Veggie Burger",
    "Chili Con Carne",
    "Baked Salmon",
    "Chicken Fajitas",
    "Onion Rings",
    " Crab Cakes",
    "Beef Stroganoff",
    "Chicken Pot Pie",
    "Fish Tacos",
    "Steak Sandwich",
    "Lentil Soup",
    "Roast Chicken",
    "Beef Jerky",
    "Pork Chops",
    "Breakfast Tacos",
    "Chicken Tikka",
    "Shrimp Cocktail",
    "Eggs Benedict",
    "Chicken Cordon Bleu",
    "Beef Burgers",
    "Tuna Salad",
    "Chicken Tacos",
    "Falafel",
    "Grilled Panini",
    "Chicken Satay",
    "Beef and Mushroom",
    "Veggie Skewers",
    "Chicken and Waffles",
    "Crab Rangoon",
    "Chicken Empanadas",
    "Beef and Onion",
    "Shrimp and Pasta",
    "Chicken Quesadilla Casserole",
    "Turkey Meatballs",
    "Chicken Tzatziki",
    "Chicken Fricassee",
    "Beef and Guinness",
    "Chicken Cacciatore",
    "Shrimp and Grits",
    "Chicken and Dumplings",
    "Beef and Broccoli Stir Fry",
    "Chicken Shawarma",
    "Chicken and Rice Bowl",
    "Turkey and Avocado Wrap",
    "Chicken Tandoori",
    "Beef and Mushroom Gravy",
    "Chicken and Spinach Calzone",
    "Shrimp and Vegetable Stir Fry",
    "Chicken and Sausage Jambalaya",
    "Beef and Cheese Frittata",
    "Chicken and Bacon Wrap",
    "Turkey and Mashed Potato Shepherd's Pie",
    "Chicken and Mushroom Crepes",
    "Beef and Vegetable Kabobs",
    "Chicken and Broccoli Pasta Bake",
    "Shrimp and Lemon Spaghetti",
    "Chicken and Asparagus Risotto",
    "Beef and Guinness Stew",
    "Chicken and Mushroom Meatball Subs",
    "Turkey and Cranberry Sandwich",
    "Chicken and Vegetable Spring Rolls",
    "Beef and Onion Meatloaf",
    "Chicken and Shrimp Paella",
    "Chicken and Mushroom Quesadillas"
]

export default function Generator() {
    const [chosenRecipeTypes, setChosenRecipeTypes] = useState<string[]>([]);

    useEffect(() => {
      const randomRecipeTypes = recipeTypes.sort(() => Math.random() - 0.5).slice(0, 12);
      setChosenRecipeTypes(randomRecipeTypes);
    }, []);

    const [loadingMessage, setLoadingMessage] = useState<string>("");
    const router = useRouter();

    const generateRecipe = async (recipeName: string) => {
      try {
        setLoadingMessage('Generating recipe...');
        const response = await postRequest('generate', { recipeRequest: recipeName });

        if (!response.ok) {
          throw new Error('Failed to generate recipe');
        }
        setLoadingMessage('Recipe generated!  Sending it to you...');

        const data = await response.json();
        if (data.recipe.id) {
          router.push(`/recipe/${data.recipe.id}`);
          return;
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingMessage('');
      }
    }

    const generateMoreIdeas = async () => {
      const response = await fetch('http://localhost:8000/dish-ideas?current=' + chosenRecipeTypes.join(','));
      const data = await response.json();
      setChosenRecipeTypes([...chosenRecipeTypes, ...data.dish_ideas]);
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-2">
        {chosenRecipeTypes.map((recipeType) => (
          <div className="col-span-1" key={recipeType}>
          <button
            className="flex items-center justify-center border border-gray-300 p-2 rounded-md w-full h-full hover:bg-gray-100 transition-colors duration-300 disabled:opacity-50"
            onClick={() => generateRecipe(recipeType)}
            disabled={loadingMessage !== ''}
          >
            {recipeType}
          </button>
          </div>
        ))}
        </div>
        <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => generateMoreIdeas()}>More ideas</button>
        {loadingMessage && <p className="text-center">{loadingMessage}</p>}
      </div>
    );
}