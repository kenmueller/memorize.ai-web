import * as admin from 'firebase-admin'

import decksClient, { DECKS_ENGINE_NAME } from '../AppSearch/decks'
import Topic from '../Topic'

const firestore = admin.firestore()

export default class Deck {
	id: string
	topics: string[]
	hasImage: boolean
	name: string
	subtitle: string
	numberOfViews: number
	numberOfUniqueViews: number
	numberOfRatings: number
	averageRating: number
	numberOfDownloads: number
	dateCreated: Date
	dateLastUpdated: Date
	
	constructor(snapshot: FirebaseFirestore.DocumentSnapshot) {
		this.id = snapshot.id
		this.topics = snapshot.get('topics')
		this.hasImage = snapshot.get('hasImage')
		this.name = snapshot.get('name')
		this.subtitle = snapshot.get('subtitle')
		this.numberOfViews = snapshot.get('viewCount')
		this.numberOfUniqueViews = snapshot.get('uniqueViewCount')
		this.numberOfRatings = snapshot.get('ratingCount')
		this.averageRating = snapshot.get('averageRating')
		this.numberOfDownloads = snapshot.get('downloadCount')
		this.dateCreated = snapshot.get('created').toDate()
		this.dateLastUpdated = snapshot.get('updated').toDate()
	}
	
	static fromId = (id: string): Promise<Deck> =>
		firestore.doc(`decks/${id}`).get().then(snapshot =>
			new Deck(snapshot)
		)
	
	index = (): Promise<void> =>
		decksClient.indexDocuments(DECKS_ENGINE_NAME, [
			this.transformDataForIndexing()
		])
	
	deleteIndex = (): Promise<void> =>
		decksClient.destroyDocuments(DECKS_ENGINE_NAME, [this.id])
	
	private transformDataForIndexing = (): object => ({
		id: this.id,
		score: this.score,
		topics: this.topics,
		has_image: this.hasImage,
		name: this.name,
		subtitle: this.subtitle,
		view_count: this.numberOfViews,
		unique_view_count: this.numberOfUniqueViews,
		rating_count: this.numberOfRatings,
		average_rating: this.averageRating,
		download_count: this.numberOfDownloads,
		created: this.dateCreated,
		updated: this.dateLastUpdated
	})
	
	get score() {
		return (
			this.numberOfViews +
			this.numberOfUniqueViews * 1.5 +
			this.numberOfRatings * 5 +
			this.averageRating * 15 +
			this.numberOfDownloads * 7.5
		)
	}
	
	getTopics = (): Promise<Topic[]> =>
		Promise.all(this.topics.map(Topic.fromId))
	
	insertIntoTopDecks = (): Promise<(FirebaseFirestore.WriteResult | null)[]> =>
		this.getTopics().then(topics =>
			Promise.all(topics.map(topic =>
				topic.getTopDecks().then(topDecks => {
					for (const i of [...topDecks.keys()])
						if (this.compareTo(topDecks[i])) {
							topDecks = topDecks.filter(deck => deck.id !== this.id)
							topDecks.splice(i, 0, this)
							topDecks = topDecks.slice(0, Topic.MAX_TOP_DECKS_LENGTH)
							return topic.documentReference.update({
								topDecks: topDecks.map(({ id }) => id)
							})
						}
					return topDecks.length < Topic.MAX_TOP_DECKS_LENGTH
						? topic.documentReference.update({
							topDecks: admin.firestore.FieldValue.arrayUnion(this.id)
						})
						: Promise.resolve(null)
				})	
			))
		)
	
	removeFromTopDecks = (): Promise<FirebaseFirestore.WriteResult[]> =>
		Promise.all(this.topics.map(topicId =>
			firestore.doc(`topics/${topicId}`).update({
				topDecks: admin.firestore.FieldValue.arrayRemove(this.id)
			})
		))
	
	compareTo = (deck: Deck): boolean => {
		let thisPoints = 0
		let deckPoints = 0
		
		if (this.numberOfViews > deck.numberOfViews)
			thisPoints += this.numberOfViews / deck.numberOfViews
		else if (deck.numberOfViews > this.numberOfViews)
			deckPoints += deck.numberOfViews / this.numberOfViews
		
		if (this.numberOfUniqueViews > deck.numberOfUniqueViews)
			thisPoints += 2 * this.numberOfUniqueViews / deck.numberOfUniqueViews
		else if (deck.numberOfUniqueViews > this.numberOfUniqueViews)
			deckPoints += 2 * deck.numberOfUniqueViews / this.numberOfUniqueViews
		
		if (this.numberOfRatings > deck.numberOfRatings)
			thisPoints += 2 * this.numberOfRatings / deck.numberOfRatings
		else if (deck.numberOfRatings > this.numberOfRatings)
			deckPoints += 2 * deck.numberOfRatings / this.numberOfRatings
		
		if (this.averageRating > deck.averageRating)
			thisPoints += 5 * this.averageRating / deck.averageRating
		else if (deck.averageRating > this.averageRating)
			deckPoints += 5 * deck.averageRating / this.averageRating
		
		if (this.numberOfDownloads > deck.numberOfDownloads)
			thisPoints += 4 * this.numberOfDownloads / deck.numberOfDownloads
		else if (deck.numberOfDownloads > this.numberOfDownloads)
			deckPoints += 4 * deck.numberOfDownloads / this.numberOfDownloads
		
		if (this.dateLastUpdated > deck.dateLastUpdated)
			thisPoints++
		else if (deck.dateLastUpdated > this.dateLastUpdated)
			deckPoints++
		
		return thisPoints >= deckPoints
	}
}
