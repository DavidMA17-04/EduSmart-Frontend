import styles from './Card.module.css'
import type { CardProps } from './Card.types'

function Card({
  children,
  variant = 'default',
  padding = 'md',
  radius = 'md',
  shadow,
  bordered = false,
  className,
  tabIndex,
  ...rest
}: CardProps) {
  const resolvedShadow = shadow ?? (variant === 'elevated' ? 'md' : 'none')
  const resolvedTabIndex = variant === 'interactive' ? (tabIndex ?? 0) : tabIndex

  const classes = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    styles[`radius-${radius}`],
    styles[`shadow-${resolvedShadow}`],
    bordered ? styles.bordered : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} tabIndex={resolvedTabIndex} {...rest}>
      {children}
    </div>
  )
}

export default Card
