import { NotFoundPage } from '@payloadcms/next/views'
import React from 'react'
import config from '@/payload.config'
import { importMap } from '../importMap.js'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

const NotFound = async ({ params, searchParams }: Args) => (
  <NotFoundPage
    config={config}
    importMap={importMap}
    params={params}
    searchParams={searchParams}
  />
)

export default NotFound
