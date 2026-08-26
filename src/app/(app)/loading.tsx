import { NenufarLoader } from '@/components/Loading/NenufarLoader'
import React from 'react'

export default function AppLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
      <NenufarLoader fullScreen />
    </div>
  )
}
