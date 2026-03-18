import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  title: string
  subtitle: string
  value: string
  footer?: ReactNode
}

export function Card({ title, subtitle, value, footer }: CardProps) {
  return (
    <section className={styles.card}>
      <header className="mb-5 space-y-1">
        <h2 className="text-sm font-medium tracking-wide text-slate-200">{title}</h2>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </header>

      <p className="font-['Space_Grotesk'] text-2xl font-semibold text-white sm:text-3xl">{value}</p>

      <footer className="mt-5 border-t border-white/10 pt-3 text-xs text-slate-400">
        {footer ?? 'Updated 5 minutes ago'}
      </footer>
    </section>
  )
}
