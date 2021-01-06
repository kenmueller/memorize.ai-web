import { useContext, useEffect } from 'react'

import SimilarDecksContext from 'contexts/SimilarDecks'
import { setSimilarDecks } from 'actions'
import Deck from 'models/Deck'

const useSimilarDecks = (deck: Deck | null | undefined, chunkSize: number) => {
	const [state, dispatch] = useContext(SimilarDecksContext)
	const similarDecks = (deck && state[deck.id]) || null
	
	useEffect(() => {
		if (!deck || Deck.similarDeckObservers[deck.id] || similarDecks)
			return
		
		Deck.similarDeckObservers[deck.id] = true
		
		deck.loadSimilarDecks(chunkSize)
			.then(newSimilarDecks =>
				dispatch(setSimilarDecks(deck.id, newSimilarDecks))
			)
	}, [deck, similarDecks, chunkSize, dispatch])
	
	return similarDecks
}

export default useSimilarDecks
