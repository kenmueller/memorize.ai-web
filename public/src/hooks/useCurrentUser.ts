import { useContext, useEffect } from 'react'

import CurrentUserContext from '../contexts/CurrentUser'
import User from '../models/User'
import LoadingState from '../models/LoadingState'
import {
	setCurrentUser,
	updateCurrentUser,
	setCurrentUserLoadingState,
	setIsObservingCurrentUser
} from '../actions'
import { compose } from '../utils'

export default (): [User | null, LoadingState] => {
	const [
		{ currentUser, currentUserLoadingState, isObservingCurrentUser },
		dispatch
	] = useContext(CurrentUserContext)
	
	useEffect(() => {
		if (currentUserLoadingState === LoadingState.None)
			User.initialize({
				setCurrentUser: compose(dispatch, setCurrentUser),
				setCurrentUserLoadingState: compose(dispatch, setCurrentUserLoadingState)
			})
	}, [currentUserLoadingState]) // eslint-disable-line
	
	useEffect(() => {
		if (!currentUser || isObservingCurrentUser)
			return
		
		currentUser.observe({
			updateCurrentUser: compose(dispatch, updateCurrentUser),
			setIsObservingCurrentUser: compose(dispatch, setIsObservingCurrentUser)
		})
	}, [currentUser, isObservingCurrentUser]) // eslint-disable-line
	
	return [currentUser, currentUserLoadingState]
}
