import type { HTMLAttributes, ReactNode } from 'react'

export type CardVariant = 'default' | 'muted' | 'elevated' | 'interactive'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'
export type CardRadius = 'sm' | 'md' | 'lg'
export type CardShadow = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: CardVariant
  padding?: CardPadding
  radius?: CardRadius
  shadow?: CardShadow
  bordered?: boolean
  className?: string
}
