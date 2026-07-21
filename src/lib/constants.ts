export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'Alphabetic A-Z',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'Latest arrivals' },
  { slug: 'priceInCOP', reverse: false, title: 'Precio: menor a mayor' }, // asc
  { slug: '-priceInCOP', reverse: true, title: 'Precio: mayor a menor' },
]
