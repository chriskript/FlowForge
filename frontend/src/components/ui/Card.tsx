import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  title: string
  titleIcon?: ReactNode
  children: ReactNode
}

export function Card({ title, titleIcon, children }: CardProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>
        {titleIcon ? <span className={styles.titleIcon}>{titleIcon}</span> : null}
        <span>{title}</span>
      </h2>
      <div className={styles.content}>{children}</div>
    </section>
  )
}
