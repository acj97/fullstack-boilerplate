import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'
}

function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'border-0 font-semibold tracking-[0.02em] text-sm py-[14px] px-[22px] inline-flex items-center justify-center gap-2 [transition:transform_.12s_ease,background_.18s,color_.18s,border-color_.18s] active:translate-y-px cursor-pointer'

  const variants = {
    primary: 'bg-ink text-bg w-full hover:bg-accent disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-ink',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
