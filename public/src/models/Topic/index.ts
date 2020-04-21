import Category, { categoryFromString, imageUrlFromCategory, defaultCategory } from './Category'
import firebase from '../../firebase'

import 'firebase/firestore'

const firestore = firebase.firestore()

export default class Topic {
	static isObserving = false
	
	id: string
	name: string
	category: Category
	imageUrl: string
	
	constructor(id: string, name: string, category: string) {
		this.id = id
		this.name = name
		this.category = categoryFromString(category)
		this.imageUrl = imageUrlFromCategory(this.category, this.name)
	}
	
	static fromSnapshot = (snapshot: firebase.firestore.DocumentSnapshot) =>
		new Topic(
			snapshot.id,
			snapshot.get('name') ?? '(error)',
			snapshot.get('category') ?? defaultCategory
		)
	
	static observeAll = (
		{ addTopic, updateTopic, removeTopic }: {
			addTopic: (snapshot: firebase.firestore.DocumentSnapshot) => void
			updateTopic: (snapshot: firebase.firestore.DocumentSnapshot) => void
			removeTopic: (id: string) => void
		}
	) =>
		firestore.collection('topics').onSnapshot(
			snapshot => {
				for (const { type, doc } of snapshot.docChanges())
					switch (type) {
						case 'added':
							addTopic(doc)
							break
						case 'modified':
							updateTopic(doc)
							break
						case 'removed':
							removeTopic(doc.id)
							break
					}
			},
			error => {
				alert(error.message)
				console.error(error)
			}
		)
	
	updateFromSnapshot = (snapshot: firebase.firestore.DocumentSnapshot) => {
		this.name = snapshot.get('name')
		this.category = categoryFromString(snapshot.get('category'))
		this.imageUrl = imageUrlFromCategory(this.category, this.name)
		
		return this
	}
}
