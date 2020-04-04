import React from 'react'

import AppStoreDownloadButton from '../shared/AppStoreDownloadButton'
import Screenshot, { ScreenshotType } from '../shared/Screenshot'

import '../../scss/components/Home/Header.scss'

export default () => (
	<div className="home header">
		<div className="left">
			<h1>
				The ultimate<br />
				memorization app
			</h1>
			<h3>Truly effective flashcards</h3>
			<div className="app-store-download-button-container">
				<AppStoreDownloadButton />
			</div>
		</div>
		<Screenshot type={ScreenshotType.Cram} className="screenshot" />
	</div>
)
