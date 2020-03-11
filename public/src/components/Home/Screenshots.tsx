import React from 'react'

import FixedContainer from './ScreenshotsFixedContainer'
import Descriptions, { DescriptionsSide } from './ScreenshotsDescriptions'
import Screenshot, { ScreenshotType } from '../shared/Screenshot'
import backgroundImage from '../../images/home-screenshots-background.png'

export const screenshots = [
	{
		type: ScreenshotType.Market,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Review,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Cram,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Editor,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Decks,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Home,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	},
	{
		type: ScreenshotType.Recap,
		descriptions: [
			{
				title: 'Share your knowledge',
				body: 'We are a community of learners that create decks for one another; all decks are public, and anyone can use them',
				margin: 20
			},
			{
				title: 'Easy-to-use rich text editor',
				body: `
					We support:
					• Images
					• Tables
					• Code (with automatic highlighting)
					• LaTeX
					• And more!
				`,
				margin: 35
			}
		]
	}
]

export default () => (
	<div className="home screenshots stack">
		<div className="background origin-top-right" />
		<div id="home-screenshots-aos-anchor-first" className="content relative">
			<FixedContainer outerClassName="background" anchor="#home-screenshots-aos-anchor-first">
				<img
					className="background"
					src={backgroundImage}
					alt="Background"
					data-aos="disappear"
					data-aos-anchor="#home-screenshots-aos-anchor-last"
					data-aos-anchor-placement="bottom-bottom"
				/>
			</FixedContainer>
			<div className="screenshots">
				{screenshots.map(({ type, descriptions }, index) => (
					<div key={index}>
						<div
							id={`home-screenshots-aos-anchor-${index}`}
							className="absolute inset-x-0"
							style={{ top: `${index * 60}vh` }}
						/>
						<FixedContainer anchor={`#home-screenshots-aos-anchor-${index}`}>
							<Descriptions
								side={DescriptionsSide.Left}
								descriptions={descriptions.filter((_, i) => !(i & 1))}
								data-aos="disappear"
								data-aos-anchor={
									`#home-screenshots-aos-anchor-${
										index === screenshots.length - 1
											? 'last'
											: index + 1
									}`
								}
								data-aos-anchor-placement={
									index === screenshots.length - 1
										? 'bottom-bottom'
										: 'top-top'
								}
							/>
							<Screenshot
								type={type}
								className="screenshot"
								data-aos="disappear"
								data-aos-anchor={
									`#home-screenshots-aos-anchor-${
										index === screenshots.length - 1
											? 'last'
											: index + 1
									}`
								}
								data-aos-anchor-placement={
									index === screenshots.length - 1
										? 'bottom-bottom'
										: 'top-top'
								}
							/>
							<Descriptions
								side={DescriptionsSide.Right}
								descriptions={descriptions.filter((_, i) => i & 1)}
								data-aos="disappear"
								data-aos-anchor={
									`#home-screenshots-aos-anchor-${
										index === screenshots.length - 1
											? 'last'
											: index + 1
									}`
								}
								data-aos-anchor-placement={
									index === screenshots.length - 1
										? 'bottom-bottom'
										: 'top-top'
								}
							/>
						</FixedContainer>
					</div>
				))}
			</div>
			<div id="home-screenshots-aos-anchor-last" className="absolute inset-x-0" />
		</div>
	</div>
)
