'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const val = e.target as HTMLFormElement
    const search = val.search as HTMLInputElement
    const newParams = new URLSearchParams(searchParams.toString())

    if (search.value) {
      newParams.set('q', search.value)
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/shop', newParams))
  }

  return (
    <form className={cn('relative w-full', className)} onSubmit={onSubmit}>
      <input
        aria-label="Buscar joyas"
        autoComplete="off"
        className="w-full rounded-full border border-neutral-200/90 bg-white py-2 pl-4 pr-10 text-sm text-neutral-700 shadow-sm placeholder:text-neutral-400 hover:border-brand/50 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-800 dark:bg-zinc-900 dark:text-neutral-200"
        defaultValue={searchParams?.get('q') || ''}
        key={searchParams?.get('q')}
        name="search"
        placeholder="Buscar joyas…"
        type="search"
      />
      <div className="pointer-events-none absolute right-0 top-0 mr-3 flex h-full items-center">
        <SearchIcon aria-hidden="true" className="h-4 w-4 text-neutral-400" />
      </div>
    </form>
  )
}
