import { useParams } from 'react-router-dom'
import { characters } from '../data'
import { BookmarkToggle } from '../components/BookmarkToggle/BookmarkToggle'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function CharacterDetailPage() {
  const { id } = useParams()
  const character = characters.find((item) => item.id === id)

  if (!character) {
    return <EmptyState title="Character not found" description={`No character with id "${id}".`} />
  }

  return (
    <article>
      <h1>{character.name}</h1>
      <p>Series: {character.series}</p>
      <BookmarkToggle contentType="character" contentId={character.id} />
      <p>{character.biography}</p>
      <h2>Traits</h2>
      <ul>
        {character.traits.map((trait) => (
          <li key={trait}>{trait}</li>
        ))}
      </ul>
    </article>
  )
}
