import React, { HTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import cx from 'classnames'

import useAuthState from '../../hooks/useAuthState'
import Logo, { LogoType } from './Logo'
import { DEFAULT_DECK_COUNT } from '../../constants'

import '../../scss/components/Navbar.scss'

export default ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
	const isSignedIn = useAuthState()
	
	return (
		<div {...props} className={cx('navbar', className)}>
			<Link to="/">
				<Logo type={LogoType.Capital} className="logo" />
			</Link>
			<div className={cx('items', { 'signed-in': isSignedIn })}>
				{isSignedIn
					? (
						<Link to="/" className="dashboard-button">
							Dashboard
						</Link>
					)
					: (
						<>
							<Link to="/market" className="market-tab">
								<FontAwesomeIcon icon={faSearch} />
								<p>Explore {DEFAULT_DECK_COUNT} decks</p>
							</Link>
							<Link to="/auth" className="auth-button">
								Log in <span>/</span> Sign up
							</Link>
						</>
					)
				}
			</div>
		</div>
	)
}
