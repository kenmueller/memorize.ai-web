import { useRef, useState, useCallback, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import NextHead from 'next/head'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroller'
import cx from 'classnames'

import { MarketQuery, MarketProps } from './models'
import Deck from 'models/Deck'
import DeckSearch, {
	DEFAULT_DECK_SORT_ALGORITHM,
	decodeDeckSortAlgorithm,
	nameForDeckSortAlgorithm,
	DeckSortAlgorithm
} from 'models/Deck/Search'
import LoadingState from 'models/LoadingState'
import searchState from 'state/search'
import formatNumber from 'lib/formatNumber'
import flattenQuery from 'lib/flattenQuery'
import useCurrentUser from 'hooks/useCurrentUser'
import Dashboard, {
	DashboardNavbarSelection as Selection
} from 'components/Dashboard'
import Head from 'components/Head'
import Input from 'components/Input'
import SortDropdown from 'components/SortDropdown'
import { DropdownShadow } from 'components/Dropdown'
import DeckRow from './DeckRow'
import Loader from 'components/Loader'

import styles from './index.module.scss'

const adClient = process.env.NEXT_PUBLIC_AD_CLIENT
if (!adClient) throw new Error('Missing ad client')

const Market: NextPage<MarketProps> = ({ decks: numberOfDecks }) => {
	const isLoading = useRef(true)
	const scrollingContainerRef = useRef(null as HTMLDivElement | null)

	const router = useRouter()

	const [currentUser, currentUserLoadingState] = useCurrentUser()
	const setSearchState = useSetRecoilState(searchState)

	const query = (router.query as MarketQuery).q ?? ''
	const sortAlgorithm =
		decodeDeckSortAlgorithm((router.query as MarketQuery).s ?? '') ??
		DEFAULT_DECK_SORT_ALGORITHM

	const [decks, setDecks] = useState([] as Deck[])
	const [isLastPage, setIsLastPage] = useState(false)
	const [isSortDropdownShowing, setIsSortDropdownShowing] = useState(false)

	const shouldHideSortAlgorithm =
		sortAlgorithm === DEFAULT_DECK_SORT_ALGORITHM ||
		sortAlgorithm === DeckSortAlgorithm.Relevance

	const topics = currentUser && currentUser.interestIds

	const getDecks = useCallback(
		async (pageNumber: number) => {
			try {
				const decks = await DeckSearch.search(query, {
					pageNumber,
					pageSize: 40,
					sortAlgorithm,
					filterForTopics:
						sortAlgorithm === DeckSortAlgorithm.Recommended ? topics : null
				})

				if (!decks.length) setIsLastPage(true)

				return decks
			} catch (error) {
				setIsLastPage(true)
				console.error(error)

				return []
			}
		},
		[query, sortAlgorithm, topics, setIsLastPage]
	)

	const loadMoreDecks = useCallback(
		async (pageNumber: number) => {
			if (isLoading.current) return

			isLoading.current = true

			setDecks([...decks, ...(await getDecks(pageNumber))])

			isLoading.current = false
		},
		[setDecks, decks, getDecks]
	)

	useEffect(() => {
		if (
			currentUserLoadingState !== LoadingState.Success ||
			(currentUser && !topics)
		)
			return

		isLoading.current = true

		setIsLastPage(false)

		let shouldContinue = true

		getDecks(1).then(decks => {
			if (!shouldContinue) return

			setDecks(decks)
			isLoading.current = false

			const container = scrollingContainerRef.current

			if (container) container.scrollTop = 0
		})

		setSearchState({ query, sortAlgorithm })

		return () => {
			shouldContinue = false
			isLoading.current = false
		}
	}, [
		currentUserLoadingState,
		currentUser,
		topics,
		query,
		sortAlgorithm,
		getDecks,
		setSearchState
	])

	const onInputRef = useCallback((input: HTMLInputElement | null) => {
		input?.focus()
	}, [])

	const setQuery = useCallback(
		(newQuery: string) => {
			router.replace(
				{
					pathname: '/market',
					query: flattenQuery({
						q: newQuery,
						s: newQuery
							? sortAlgorithm === DEFAULT_DECK_SORT_ALGORITHM
								? DeckSortAlgorithm.Relevance
								: sortAlgorithm
							: sortAlgorithm === DeckSortAlgorithm.Relevance
							? null
							: sortAlgorithm
					})
				},
				undefined,
				{ shallow: true }
			)
		},
		[router, sortAlgorithm]
	)

	const setSortAlgorithm = useCallback(
		(newAlgorithm: DeckSortAlgorithm) => {
			router.replace(
				{
					pathname: '/market',
					query: flattenQuery({
						q: query,
						s:
							newAlgorithm === DEFAULT_DECK_SORT_ALGORITHM ? null : newAlgorithm
					})
				},
				undefined,
				{ shallow: true }
			)
		},
		[router, query]
	)

	useEffect(() => {
		interface Ad {
			adsbygoogle: unknown[]
		}

		;(((window as unknown) as Ad).adsbygoogle ||= []).push({})
	}, [])

	return (
		<Dashboard
			className={styles.root}
			sidebarClassName={styles.sidebar}
			contentClassName={styles.content}
			selection={Selection.Market}
		>
			<Head
				title={`${query && `${query} | `}${
					shouldHideSortAlgorithm
						? ''
						: `${nameForDeckSortAlgorithm(sortAlgorithm)} | `
				}memorize.ai Marketplace`}
				description="Search the Marketplace on memorize.ai. Unlock your true potential by using Artificial Intelligence to help you learn."
				breadcrumbs={url => [[{ name: 'Market', url }]]}
			/>
			<NextHead>
				<script
					key="ad"
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
					async
				/>
			</NextHead>
			<div className={styles.header}>
				<Link href="/new">
					<a
						className={styles.new}
						aria-label="Create your own deck!"
						data-balloon-pos="right"
					>
						<FontAwesomeIcon className={styles.newIcon} icon={faPlus} />
					</a>
				</Link>
				<Input
					ref={onInputRef}
					className={styles.search}
					inputClassName={styles.searchInput}
					iconClassName={styles.searchIcon}
					icon={faSearch}
					type="name"
					name="search_term_string"
					placeholder={`Explore ${
						numberOfDecks === null ? '...' : formatNumber(numberOfDecks)
					} decks`}
					value={query}
					setValue={setQuery}
				/>
				<SortDropdown
					shadow={DropdownShadow.Screen}
					isShowing={isSortDropdownShowing}
					setIsShowing={setIsSortDropdownShowing}
					algorithm={sortAlgorithm}
					setAlgorithm={setSortAlgorithm}
				/>
			</div>
			<div ref={scrollingContainerRef} className={styles.decks}>
				<ins
					className={cx(styles.ad, 'adsbygoogle')}
					data-ad-format="fluid"
					data-ad-layout-key="-g5-9+54-k3+ms"
					data-ad-client={adClient}
					data-ad-slot="4119250740"
				/>
				<InfiniteScroll
					className={styles.decksContent}
					loadMore={loadMoreDecks}
					hasMore={!isLastPage}
					loader={
						<Loader
							key={0}
							className={styles.loader}
							size="24px"
							thickness="4px"
							color={decks.length ? '#582efe' : 'white'}
						/>
					}
					useWindow={false}
				>
					{decks.map(deck => (
						<DeckRow key={deck.id} deck={deck} />
					))}
				</InfiniteScroll>
			</div>
		</Dashboard>
	)
}

export default Market
