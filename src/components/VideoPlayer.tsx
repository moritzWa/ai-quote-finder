import clsx from 'clsx'
import React from 'react'

interface VideoPlayerProps {
  src: string
  width: number
  height: number
  className?: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  width,
  height,
  className,
}) => {
  return (
    <div
      className={clsx(
        'shadow-lg md:rounded-3xl inline-block mx-auto p-0',
        className,
      )}
    >
      <video
        height={height}
        width={width}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full rounded-lg object-cover"
      >
        <source src={src} type="video/webm" />
      </video>
    </div>
  )
}

export default VideoPlayer
