import type { ReactNode } from 'react'

export function ScreenFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <article className="screen-frame">
      <header>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <section className="screen-body">{children}</section>
    </article>
  )
}
