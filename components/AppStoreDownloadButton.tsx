import { HTMLAttributes } from 'react'
import { Svg } from 'react-optimized-image'

import { APP_STORE_URL } from 'lib/constants'
import icon from 'images/app-store-download.svg'

const AppStoreDownloadButton = (props: HTMLAttributes<HTMLAnchorElement>) => (
	<a
		{...props}
		href={APP_STORE_URL}
		target="_blank"
		rel="nofollow noreferrer noopener"
	>
		<Svg src={icon} />
	</a>
)

export default AppStoreDownloadButton
