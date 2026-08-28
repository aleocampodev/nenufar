import { NenufarLoader } from '@/components/Loading/NenufarLoader'
import React from 'react'

export default function Loading() {
  return (
    <div className="container py-20 flex items-center justify-center">
      <NenufarLoader />
    </div>
  )
}
