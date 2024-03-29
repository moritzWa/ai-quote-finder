import React from 'react'

interface VideoPlayerProps {
  src: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="shadow-lg md:rounded-3xl inline-block mx-auto p-0">
      <video
        height={500}
        width={643}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full rounded-lg object-cover md:h-[500px] md:w-[643px] lg:h-[500px] lg:w-[643px]"
      >
        <source src={src} type="video/webm" />
      </video>
    </div>
  )
}

export default VideoPlayer
