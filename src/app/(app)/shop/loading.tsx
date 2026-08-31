import { NenufarLoader } from '@/components/Loading/NenufarLoader'
import React from 'react'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF8F5]">
      <NenufarLoader />
    </div>
  )
}
