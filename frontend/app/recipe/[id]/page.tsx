import LoadRecipe from '@/components/LoadRecipe'

interface PageProps {
    params: { id: string }
}

export default function RecipePage({ params }: PageProps) {
    const { id } = params

    // const data =  await res.json()

    return (
        <main className="container mx-auto p-4">
          <LoadRecipe id={id} />
        </main>
    )
}