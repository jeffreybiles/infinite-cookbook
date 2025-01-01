import ReactMarkdown from 'react-markdown'

export default function DisplayRecipe({ recipe }: { recipe: string }) {
    return <div className="flex flex-col gap-2 w-full">
        <ReactMarkdown>{recipe}</ReactMarkdown>
    </div>
}