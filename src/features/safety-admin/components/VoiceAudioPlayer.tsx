import * as React from "react"
import { Play, Pause, Trash2, Mic } from "lucide-react"

interface VoiceAudioPlayerProps {
  audioUri: string
  duration?: number
  label?: string
  onRemove?: () => void
}

export function VoiceAudioPlayer({
  audioUri,
  duration = 0,
  label = "Foreman Field Voice Recording",
  onRemove,
}: VoiceAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [audioDuration, setAudioDuration] = React.useState(duration || 0)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => console.warn("[VoiceAudioPlayer] Playback error:", err))
      setIsPlaying(true)
    }
  }

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) secs = 0
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs shadow-2xs transition-all ${
        isPlaying ? "ring-2 ring-orange-500/30 bg-orange-500/15" : ""
      }`}
    >
      <audio
        ref={audioRef}
        src={audioUri}
        preload="metadata"
        onLoadedMetadata={() => {
          if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
            setAudioDuration(audioRef.current.duration)
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
            if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
              setAudioDuration(audioRef.current.duration)
            }
          }
        }}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={togglePlay}
          className={`size-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs active:scale-95 ${
            isPlaying
              ? "bg-[#ea580c] text-white ring-2 ring-orange-400"
              : "bg-[#f95721] hover:bg-[#ea580c] text-white"
          }`}
          title={isPlaying ? "Pause voice note" : "Listen to exact voice recording"}
        >
          {isPlaying ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current ml-0.5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-bold text-[11px] text-foreground tracking-tight flex items-center gap-1.5 truncate">
              <Mic className="size-3 text-[#f95721] shrink-0" />
              <span className="truncate">{label}</span>
            </span>
            <span className="text-[10px] font-mono text-muted-foreground font-bold shrink-0">
              {formatTime(currentTime)} / {formatTime(audioDuration || duration || 4)}
            </span>
          </div>

          {/* Equalizer animation bar when playing */}
          <div className="flex items-center gap-1 h-3 mt-1">
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-3 animate-bounce delay-75" : "h-1 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-3.5 animate-bounce delay-150" : "h-1.5 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-2.5 animate-bounce delay-100" : "h-1 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-4 animate-bounce delay-200" : "h-2 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-2 animate-bounce delay-75" : "h-1 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-3 animate-bounce delay-150" : "h-1.5 opacity-60"
              }`}
            />
            <span
              className={`w-1 bg-[#f95721] rounded-full transition-all duration-150 ${
                isPlaying ? "h-1.5 animate-bounce delay-100" : "h-1 opacity-60"
              }`}
            />
          </div>
        </div>
      </div>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="size-7 rounded-lg text-rose-600 hover:bg-rose-500/10 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          title="Remove voice note"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  )
}
