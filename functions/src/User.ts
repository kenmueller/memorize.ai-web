import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import Slug from './Slug'
import Deck from './Deck'

const firestore = admin.firestore()
const auth = admin.auth()

export default class User {
	static updateLastActivity(uid: string): Promise<any> {
		return firestore.doc(`users/${uid}`).update({ lastActivity: new Date() })
	}
}

export const userCreated = functions.firestore.document('users/{uid}').onCreate((change, context) => {
	const uid = context.params.uid
	const name = change.get('name')
	return Promise.all([
		updateDisplayName(uid, name),
		change.get('slug') ? Promise.resolve() : Slug.find(name).then(slug =>
			firestore.doc(`users/${uid}`).update({ slug, lastNotification: 0 })
		)
	])
})

export const userUpdated = functions.firestore.document('users/{uid}').onUpdate((change, context) => {
	const after = change.after.get('name')
	return Promise.all([
		change.before.get('name') === after ? Promise.resolve() : updateDisplayName(context.params.uid, after),
		User.updateLastActivity(context.params.uid)
	])
})

export const userDeleted = functions.auth.user().onDelete(user =>
	firestore.doc(`users/${user.uid}`).delete()
)

export const updateLastOnline = functions.https.onCall((_data, context) =>
	firestore.doc(`users/${context.auth!.uid}`).update({ lastOnline: new Date() })
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

function updateDisplayName(uid: string, displayName: string): Promise<any> {
	return displayName ? auth.updateUser(uid, { displayName }) : Promise.resolve()
}