import { NenufarLoader } from '@/components/Loading/NenufarLoader'
import React from 'react'

export default function RootLoading() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FAF8F5]">
      <NenufarLoader fullScreen />
    </div>
  )
}
