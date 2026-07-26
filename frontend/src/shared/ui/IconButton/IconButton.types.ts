import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  'aria-label': string
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}
