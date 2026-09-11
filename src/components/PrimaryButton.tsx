import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PrimaryButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button className={`primary-button ${className}`} {...props}><span>{children}</span><span aria-hidden="true">↗</span></button>
}
