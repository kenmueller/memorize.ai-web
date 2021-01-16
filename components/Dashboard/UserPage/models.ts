import { ParsedUrlQuery } from 'querystring'

import { UserData } from 'models/User'
import { DeckData } from 'models/Deck'
import { ActivityNodeData } from 'models/ActivityNode'

export interface UserPageQuery extends ParsedUrlQuery {
	slugId: string
	slug: string
}

export interface UserPageProps {
	user: UserData
	activity: Record<number, ActivityNodeData>
	decks: DeckData[]
}

export interface UserPagePath {
	params: UserPageQuery
}