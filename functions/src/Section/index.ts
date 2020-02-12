import * as admin from 'firebase-admin'

import Batch from '../Utils/Batch'

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
	
	static fromId = async (sectionId: string, deckId: string) =>
		new Section(await firestore.doc(`decks/${deckId}/sections/${sectionId}`).get())
	
	deleteCards = async (deckId: string) => {
		const { docs: cards } = await firestore
			.collection(`decks/${deckId}/cards`)
			.where('section', '==', this.id)
			.get()
		
		const batch = new Batch
		
		for (const { ref } of cards)
			batch.delete(ref)
		
		return batch.commit()
	}
}
