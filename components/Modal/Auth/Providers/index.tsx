import { useState, useCallback } from 'react'
import { Svg } from 'react-optimized-image'

import User from 'models/User'
import LoadingState from 'models/LoadingState'
import firebase from 'lib/firebase'
import useOnSignUp from 'hooks/useOnSignUp'
import Button from 'components/Button'

import apple from 'images/icons/apple.svg'
import google from 'images/icons/google.svg'

import styles from './index.module.scss'

import 'firebase/auth'

const auth = firebase.auth()

const appleAuthProvider = new firebase.auth.OAuthProvider('apple.com')
appleAuthProvider.addScope('name')
appleAuthProvider.addScope('email')

const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.email')

export interface AuthModalProvidersProps {
	initialXp: number
	callback: ((user: User) => void) | null
	isDisabled: boolean
	setIsDisabled(isDisabled: boolean): void
	setErrorMessage(message: string | null): void
}

const AuthModalProviders = ({
	initialXp,
	callback,
	isDisabled,
	setIsDisabled,
	setErrorMessage
}: AuthModalProvidersProps) => {
	const onSignUp = useOnSignUp()

	const [appleAuthLoadingState, setAppleAuthLoadingState] = useState(
		LoadingState.None
	)
	const [googleAuthLoadingState, setGoogleAuthLoadingState] = useState(
		LoadingState.None
	)

	const logIn = useCallback(
		async (
			method: 'apple' | 'google',
			setLoadingState: (loadingState: LoadingState) => void,
			provider: firebase.auth.OAuthProvider | firebase.auth.GoogleAuthProvider
		) => {
			try {
				setIsDisabled(true)

				setLoadingState(LoadingState.None)
				setErrorMessage(null)

				const { user, additionalUserInfo } = await auth.signInWithPopup(
					provider
				)

				if (!(user && additionalUserInfo))
					throw new Error('An unknown error occurred. Please try again')

				if (!user.email) throw new Error('Unable to get your email address')

				if (!additionalUserInfo.isNewUser) return

				setLoadingState(LoadingState.Loading)

				await User.create({
					id: user.uid,
					name: user.displayName ?? 'Anonymous',
					email: user.email,
					method,
					xp: initialXp
				})

				setIsDisabled(false)
				setLoadingState(LoadingState.Success)

				onSignUp()
			} catch (error) {
				setIsDisabled(false)

				if (
					error.code === 'auth/popup-closed-by-user' ||
					error.code === 'auth/cancelled-popup-request'
				) {
					setLoadingState(LoadingState.None)
					setErrorMessage(null)
					return
				}

				console.error(error)

				setLoadingState(LoadingState.Fail)
				setErrorMessage(error.message)
			}
		},
		[setIsDisabled, setErrorMessage, initialXp, callback, onSignUp]
	)

	const logInWithApple = useCallback(async () => {
		logIn('apple', setAppleAuthLoadingState, appleAuthProvider)
	}, [logIn, setAppleAuthLoadingState])

	const logInWithGoogle = useCallback(async () => {
		logIn('google', setGoogleAuthLoadingState, googleAuthProvider)
	}, [logIn, setGoogleAuthLoadingState])

	return (
		<div className={styles.root}>
			<Button
				type="button"
				className={styles.button}
				loaderSize="20px"
				loaderThickness="4px"
				loaderColor="white"
				loading={appleAuthLoadingState === LoadingState.Loading}
				disabled={isDisabled}
				onClick={logInWithApple}
			>
				<Svg className={styles.icon} src={apple} />
				<span className={styles.text}>Log in</span>
			</Button>
			<Button
				type="button"
				className={styles.button}
				loaderSize="20px"
				loaderThickness="4px"
				loaderColor="white"
				loading={googleAuthLoadingState === LoadingState.Loading}
				disabled={isDisabled}
				onClick={logInWithGoogle}
			>
				<Svg className={styles.icon} src={google} />
				<span className={styles.text}>Log in</span>
			</Button>
		</div>
	)
}

export default AuthModalProviders
