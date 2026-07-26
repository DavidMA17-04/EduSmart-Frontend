import styles from './IconButton.module.css'
import type { IconButtonProps } from './IconButton.types'

function IconButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
  onClick,
  ...rest
}: IconButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], disabled ? styles.disabled : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}

export default IconButton
