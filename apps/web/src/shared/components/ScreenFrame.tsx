import type { ReactNode } from 'react'

export function ScreenFrame({
  title,
  subtitle,
  frameClassName,
  headerAction,
  children,
}: {
  title: string
  subtitle: string
  frameClassName?: string
  headerAction?: ReactNode
  children: ReactNode
}) {
  return (
    <article className={frameClassName ? `screen-frame ${frameClassName}` : 'screen-frame'}>
      <header>
        <div className="screen-header-row">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {headerAction ? <div className="screen-header-action">{headerAction}</div> : null}
        </div>
      </header>
      <section className="screen-body">{children}</section>
    </article>
  )
}
