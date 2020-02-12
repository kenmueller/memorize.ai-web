import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Deck from '..'
import User from '../../User'
import Batch from '../../Utils/Batch'

const firestore = admin.firestore()

export default functions
	.runWith({ timeoutSeconds: 540, memory: '2GB' })
	.firestore
	.document('users/{uid}/decks/{deckId}').onDelete((snapshot, { params: { uid, deckId } }) => {
		const oldRating: number | undefined = snapshot.get('rating')
		
		return Promise.all([
			Deck.decrementCurrentUserCount(deckId),
			User.decrementDeckCount(uid),
			oldRating
				? Deck.updateRating(uid, deckId, oldRating, undefined)
				: Promise.resolve(null),
			Deck.removeUserFromCurrentUsers(deckId, uid),
			removeAllCardsAndHistory(uid, deckId)
		])
	})

const removeAllCardsAndHistory = async (uid: string, deckId: string) => {
	const cards = await firestore.collection(`users/${uid}/decks/${deckId}/cards`).listDocuments()
	
	const batch = new Batch
	
	for (const card of cards) {
		batch.delete(card)
		
		;(await card.collection('history').listDocuments())
			.forEach(batch.delete)
	}
	
	return batch.commit()
}
