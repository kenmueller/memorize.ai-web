import React from 'react'

import Card from '../../../models/Card'
import Base from './Base'

export default ({ card }: { card: Card }) => (
	<div
		className="card-cell default"
		itemScope
		itemID={card.id}
		itemType="https://schema.org/Thing"
	>
		<Base card={card} />
	</div>
)
