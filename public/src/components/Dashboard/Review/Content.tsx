import React, { memo, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import useReviewState from './useReviewState'
import Navbar from './Navbar'
import CardContainer from './CardContainer'
import Footer from './Footer'
import ProgressModal from './ProgressModal'
import RecapModal from './RecapModal'

import '../../../scss/components/Dashboard/Review.scss'

const ReviewContent = () => {
	const { slugId, slug, sectionId } = useParams()
	const {
		deck,
		card,
		loadingState,
		isWaitingForRating,
		waitForRating,
		cardClassName,
		currentSide,
		currentIndex,
		count,
		flip,
		rate,
		progressData,
		isProgressModalShowing,
		setIsProgressModalShowing,
		recapData,
		isRecapModalShowing,
		setIsRecapModalShowing,
		showRecap
	} = useReviewState(slugId, slug, sectionId)
	
	const backUrl = useMemo(() => (
		slugId && slug
			? `/decks/${slugId}/${slug}`
			: '/'
	), [slugId, slug])
	
	return (
		<div className="mask" onClick={waitForRating}>
			<Navbar
				backUrl={backUrl}
				currentIndex={currentIndex}
				count={count}
				recap={showRecap}
			/>
			<CardContainer
				deck={deck}
				section={card && card.section}
				card={card}
				loadingState={loadingState}
				isWaitingForRating={isWaitingForRating}
				cardClassName={cardClassName}
				currentSide={currentSide}
				flip={flip}
			/>
			<Footer
				isWaitingForRating={isWaitingForRating}
				predictions={card && card.predictions}
				rate={rate}
			/>
			<ProgressModal
				data={progressData}
				isShowing={isProgressModalShowing}
				setIsShowing={setIsProgressModalShowing}
			/>
			<RecapModal
				data={recapData}
				backUrl={backUrl}
				isShowing={isRecapModalShowing}
				setIsShowing={setIsRecapModalShowing}
			/>
		</div>
	)
}

export default memo(ReviewContent)
