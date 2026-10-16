'use client'

import { ChevronDownIcon } from 'lucide-react'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { ListItem } from '.'

import { FilterItem } from './FilterItem'

export function FilterItemDropdown({ list }: { list: ListItem[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [active, setActive] = useState('')
  const [openSelect, setOpenSelect] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpenSelect(false)
      }
    }

    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    list.forEach((listItem: ListItem) => {
      if (
        ('path' in listItem && pathname === listItem.path) ||
        ('slug' in listItem && searchParams.get('sort') === listItem.slug)
      ) {
        setActive(listItem.title)
      }
    })
    // A selection navigates (new searchParams): close the panel for mouse
    // and keyboard users alike. No onClick on the panel itself is needed.
    setOpenSelect(false)
  }, [pathname, list, searchParams])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={openSelect}
        aria-haspopup="listbox"
        className="flex w-full cursor-pointer items-center justify-between rounded border border-black/30 px-4 py-2 text-left text-sm dark:border-white/30"
        onClick={() => {
          setOpenSelect(!openSelect)
        }}
      >
        <div>{active}</div>
        <ChevronDownIcon className="h-4" />
      </button>
      {openSelect && (
        <div className="absolute z-40 w-full rounded-b-md bg-white p-4 shadow-md dark:bg-black">
          {list.map((item: ListItem, i) => (
            <FilterItem item={item} key={i} />
          ))}
        </div>
      )}
    </div>
  )
}
