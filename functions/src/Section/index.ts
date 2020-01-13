import * as admin from 'firebase-admin'

import DeckUserData from '../Deck/UserData'
import Card from '../Card'
import CardUserData from '../Card/UserData'

const firestore = admin.firestore()

export default class Section {
	static unsectionedId = ''
	
	id: string
	name: string
	numberOfCards: number
	
	constructor(snapshot: FirebaseFirestore.DocumentSnapshot) {
		this.id = snapshot.id
		this.name = snapshot.get('name')
		this.numberOfCards = snapshot.get('cardCount') ?? 0
	}
	
	static fromId = (sectionId: string, deckId: string): Promise<Section> =>
		firestore.doc(`decks/${deckId}/sections/${sectionId}`).get().then(snapshot =>
			new Section(snapshot)
		)
	
	deleteCards = (deckId: string): Promise<FirebaseFirestore.WriteResult[]> =>
		firestore
			.collection(`decks/${deckId}/cards`)
			.where('section', '==', this.id)
			.get()
			.then(({ docs: cards }) => {
				const batch = firestore.batch()
				
				for (const { ref } of cards)
					batch.delete(ref)
				
				return batch.commit()
			})
}
