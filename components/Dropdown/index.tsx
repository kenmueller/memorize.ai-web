import {
	ReactNode,
	SetStateAction,
	useRef,
	useEffect,
	useCallback
} from 'react'
import cx from 'classnames'

import styles from './index.module.scss'

export enum DropdownShadow {
	None = 'none',
	Around = 'around',
	Screen = 'screen'
}

export interface DropdownProps {
	className?: string
	triggerClassName?: string
	contentClassName?: string
	shadow: DropdownShadow
	isRightAligned?: boolean
	trigger: ReactNode
	isShowing: boolean
	setIsShowing(isShowing: SetStateAction<boolean>): void
	children?: ReactNode
}

const Dropdown = ({
	className,
	triggerClassName,
	contentClassName,
	shadow,
	isRightAligned = true,
	trigger,
	isShowing,
	setIsShowing,
	children
}: DropdownProps) => {
	const ref = useRef(null as HTMLDivElement | null)

	const toggleIsShowing = useCallback(() => {
		setIsShowing(isShowing => !isShowing)
	}, [setIsShowing])

	useEffect(() => {
		const onClick = ({ target }: Event) => {
			const { current } = ref

			if (
				!current ||
				target === current ||
				current.contains(target as Node | null) ||
				!isShowing
			)
				return

			setIsShowing(false)
		}

		const { body } = document

		body.addEventListener('click', onClick)
		return () => body.removeEventListener('click', onClick)
	}, [isShowing, setIsShowing])

	return (
		<div
			className={cx(styles.root, className, {
				[styles.showing]: isShowing
			})}
		>
			<div ref={ref}>
				<button
					className={triggerClassName}
					type="button"
					onClick={toggleIsShowing}
					aria-haspopup="menu"
				>
					{trigger}
				</button>
				<div
					className={cx(styles.content, contentClassName, {
						[styles.right]: isRightAligned,
						[styles[`shadow_${shadow}`]]: shadow !== DropdownShadow.None
					})}
					aria-hidden={!isShowing}
				>
					{children}
				</div>
			</div>
		</div>
	)
}

export default Dropdown
