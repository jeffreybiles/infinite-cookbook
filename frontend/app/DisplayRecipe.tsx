import ReactMarkdown from 'react-markdown'

export default function DisplayRecipe({ recipe }: { recipe: string }) {
    return <ReactMarkdown>{recipe}</ReactMarkdown>
}