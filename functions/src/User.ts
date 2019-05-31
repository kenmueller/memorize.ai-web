import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'
import Deck from './Deck'
import Algolia from './Algolia'

const firestore = admin.firestore()
const auth = admin.auth()

export default class User {
	static updateLastActivity(uid: string): Promise<FirebaseFirestore.WriteResult> {
		return firestore.doc(`users/${uid}`).update({ lastActivity: new Date })
	}
}

export const userCreated = functions.firestore.document('users/{uid}').onCreate((snapshot, context) => {
	const uid = context.params.uid
	const name = snapshot.get('name')
	return Promise.all([
		Algolia.create({ index: Algolia.indices.users, snapshot }),
		updateDisplayName(uid, name),
		snapshot.get('slug') ? Promise.resolve() : Slug.find(name).then(slug =>
			firestore.doc(`users/${uid}`).update({ slug, lastNotification: 0 }) as Promise<any>
		)
	])
})

export const userUpdated = functions.firestore.document('users/{uid}').onUpdate((change, context) => {
	const afterName = change.after.get('name')
	return change.before.get('lastActivity') === change.after.get('lastActivity') && change.before.get('lastOnline') === change.after.get('lastOnline')
		? Promise.all([
			Algolia.update({ index: Algolia.indices.users, change }),
			change.before.get('name') === afterName ? Promise.resolve() : updateDisplayName(context.params.uid, afterName),
			User.updateLastActivity(context.params.uid)
		])
		: Promise.resolve()
})

export const userDeleted = functions.auth.user().onDelete(user => {
	const id = user.uid
	return Promise.all([
		Algolia.delete({ index: Algolia.indices.users, id }),
		firestore.doc(`users/${id}`).delete()
	])
})

export const updateLastOnline = functions.https.onCall((_data, context) =>
	firestore.doc(`users/${context.auth!.uid}`).update({ lastOnline: new Date })
)

export const deckAdded = functions.firestore.document('users/{uid}/decks/{deckId}').onCreate((_snapshot, context) =>
	Deck.user(context.params.uid, context.params.deckId).then(user =>
		Promise.all([
			Deck.updateDownloads(context.params.deckId, { total: user!.past ? 0 : 1, current: 1 }),
			Deck.doc(context.params.deckId, `users/${context.params.uid}`).update({ past: true, current: true }),
			User.updateLastActivity(context.params.uid)
		])
	)
)

export const deckRemoved = functions.firestore.document('users/{uid}/decks/{deckId}').onDelete((_snapshot, context) =>
	Promise.all([
		Deck.updateDownloads(context.params.deckId, { total: 0, current: -1 }),
		Deck.doc(context.params.deckId, `users/${context.params.uid}`).update({ current: false }),
		User.updateLastActivity(context.params.uid)
	])
)

function updateDisplayName(uid: string, displayName: string): Promise<void | admin.auth.UserRecord> {
	return displayName ? auth.updateUser(uid, { displayName }) : Promise.resolve()
}