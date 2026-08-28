"use client"

import React, { useRef, useState } from "react"
import { Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react"

interface VideoPlayerProps {
  videoUrl?: string | null
  caption?: string | null
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-hands-of-an-artisan-weaving-a-basket-43403-large.mp4",
  caption = "El arte de tejer paciencia: experiencia vivencial en Cartagena con Shirley.",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Marco Celular / Reel 9:16 Claro */}
      <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-300 bg-stone-900 group">
        {/* Badge Superior */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] uppercase tracking-widest font-semibold border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Taller en Vivo</span>
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl || undefined}
          poster="/media/taller-artesanal-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Botones de Control Flotantes */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/10"
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={togglePlay}
            className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors border border-white/10"
            aria-label={isPlaying ? "Pausar video" : "Reproducir"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* Degradado inferior sutil */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Pie de Video Editorial */}
      {caption && (
        <p className="mt-4 text-xs sm:text-sm text-stone-600 font-light text-center leading-relaxed max-w-xs">
          {caption}
        </p>
      )}
    </div>
  )
}
