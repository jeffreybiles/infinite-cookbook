import ReactMarkdown from 'react-markdown'

export default function DisplayRecipe({ recipe, name }: { recipe: string, name: string }) {
    return <div className="flex flex-col gap-2 w-full">
        <h1 className="text-2xl font-bold">{name}</h1>
        <ReactMarkdown>{recipe}</ReactMarkdown>
    </div>
}