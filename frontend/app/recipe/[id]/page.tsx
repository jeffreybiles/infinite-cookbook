import LoadRecipe from '@/components/LoadRecipe'
import Updater from '@/components/Updater'

interface PageProps {
    params: { id: string }
}

export default function RecipePage({ params }: PageProps) {
    const { id } = params

    return (
        <main className="container mx-auto p-4">
          <Updater recipe_id={id} />
          <LoadRecipe id={id} />
        </main>
    )
}