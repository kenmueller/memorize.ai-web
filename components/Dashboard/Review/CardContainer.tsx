import { useCallback, MouseEvent, useState, useEffect, useMemo } from 'react'
import { Svg } from 'react-optimized-image'
import cx from 'classnames'

import Deck from 'models/Deck'
import Section from 'models/Section'
import LoadingState from 'models/LoadingState'
import { ReviewCard } from './useReviewState'
import CardSide from 'components/CardSide'
import Loader from 'components/Loader'

import toggle from 'images/icons/toggle.svg'

const ReviewCardContainer = (
	{ deck, section, card, loadingState, isWaitingForRating, cardClassName, currentSide, flip }: {
		deck: Deck | null
		section: Section | null
		card: ReviewCard | null
		loadingState: LoadingState
		isWaitingForRating: boolean
		cardClassName: string | undefined
		currentSide: 'front' | 'back'
		flip: () => void
	}
) => {
	const [toggleTurns, setToggleTurns] = useState(0)
	
	const isReady = useMemo(() => (
		card && (loadingState === LoadingState.Success)
	), [card, loadingState])
	
	const onCardClick = useCallback((event: MouseEvent) => {
		if (!isWaitingForRating)
			return
		
		event.stopPropagation()
		flip()
	}, [isWaitingForRating, flip])
	
	useEffect(() => {
		setToggleTurns(turns => turns + 1)
	}, [currentSide, setToggleTurns])
	
	return (
		<div className="card-container">
			<div className="location">
				{deck
					? <p className="deck">{deck.name}</p>
					: <Loader size="20px" thickness="4px" color="white" />
				}
				{section && (
					<>
						<div className="divider" />
						<p className="section">{section.name}</p>
					</>
				)}
				{card?.isNew && (
					<p className="flag">New</p>
				)}
			</div>
			<div
				className={cx('cards', { clickable: isWaitingForRating })}
				onClick={onCardClick}
			>
				<div className={cx(
					'card',
					'foreground',
					cardClassName,
					{ loading: !isReady }
				)}>
					{isReady
						? (
							<div className="container">
								<CardSide className="content">
									{card!.value[currentSide]}
								</CardSide>
								{isWaitingForRating && (
									<div className="flip">
										<p>{currentSide}</p>
										<Svg
											src={toggle}
											style={{ transform: `scale(3) rotate(${toggleTurns}turn)` }}
										/>
									</div>
								)}
							</div>
						)
						: <Loader size="30px" thickness="5px" color="#582efe" />
					}
				</div>
				<div className="card background-1" />
				<div className="card background-2" />
			</div>
		</div>
	)
}

export default ReviewCardContainer
