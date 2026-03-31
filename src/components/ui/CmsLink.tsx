'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

type CmsLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  href?: string | null
  children: ReactNode
  openInNewTab?: boolean
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
}

export default function CmsLink({
  href,
  children,
  openInNewTab = false,
  rel,
  ...props
}: CmsLinkProps) {
  const safeHref = href && href.trim().length > 0 ? href : '#'
  const external = openInNewTab || isExternalHref(safeHref)
  const nextRel = external ? rel || 'noopener noreferrer' : rel

  if (external) {
    return (
      <a href={safeHref} target={openInNewTab ? '_blank' : props.target} rel={nextRel} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={safeHref} {...props}>
      {children}
    </Link>
  )
}
