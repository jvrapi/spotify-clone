import { useCallback, useEffect, useState } from 'react'

import {
  HeartIcon,
  VolumeUpIcon as VolumeDownIcon,
} from '@heroicons/react/outline'
import {
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplyIcon,
  RewindIcon,
  VolumeUpIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react/solid'
import { debounce } from 'lodash'
import { useSession } from 'next-auth/react'
import { useRecoilState } from 'recoil'

import { currentTrackIdState, isPlayingState } from '../../atoms/songAtom'
import { useSongInfo } from '../../hooks/useSongInfo'
import { useSpotify } from '../../hooks/useSpotift'

const Player: React.FC = () => {
  const spotifyApi = useSpotify()
  const { data: session, status } = useSession()

  const [currentTrackId, setCurrentTrackId] =
    useRecoilState(currentTrackIdState)

  const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState)

  const [volume, setVolume] = useState(50)

  const songInfo = useSongInfo()

  const fetchCurrentSong = async () => {
    if (!songInfo) {
      const playingTrack = await spotifyApi.getMyCurrentPlayingTrack()
      console.log('Now playing: ', playingTrack.body?.item)
      setCurrentTrackId(playingTrack.body?.item?.id)

      const currentPlaybackState = await spotifyApi.getMyCurrentPlaybackState()
      setIsPlaying(currentPlaybackState.body?.is_playing)
    }
  }

  const handlePlayPause = async () => {
    const currentPlaybackState = await spotifyApi.getMyCurrentPlaybackState()

    if (currentPlaybackState.body.is_playing) {
      spotifyApi.pause()
      setIsPlaying(false)
    } else {
      spotifyApi.play()
      setIsPlaying(true)
    }
  }

  const debounceAjustVolume = useCallback(
    debounce((volume) => {
      spotifyApi.setVolume(volume).catch((err) => {})
    }, 100),
    []
  )

  useEffect(() => {
    if (spotifyApi.getAccessToken() && !currentTrackId) {
      fetchCurrentSong()
      setVolume(50)
    }
  }, [currentTrackIdState, spotifyApi, session])

  useEffect(() => {
    if (volume > 0 && volume < 100) {
      debounceAjustVolume(volume)
    }
  }, [volume])

  return (
    <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xm md:text-base px-2 md:px-8">
      {/* Left */}
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-10 w-10"
          src={songInfo?.album.images?.[0]?.url}
          alt="AlbumImage"
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p>{songInfo?.artist?.[0]?.name}</p>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-evenly">
        <SwitchHorizontalIcon className="button" />

        <RewindIcon className="button" />

        {isPlaying ? (
          <PauseIcon className="button w-10 h-10" onClick={handlePlayPause} />
        ) : (
          <PlayIcon className="button w-10 h-10" onClick={handlePlayPause} />
        )}

        <FastForwardIcon className="button" />

        <ReplyIcon className="button" />
      </div>

      {/* Right */}
      <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
        <VolumeDownIcon
          className="button"
          onClick={() => volume > 0 && setVolume(volume - 10)}
        />
        <input
          className="w-14 md:w-28"
          type="range"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          max={100}
        />
        <VolumeUpIcon
          className="button"
          onClick={() => volume < 100 && setVolume(volume + 10)}
        />
      </div>
    </div>
  )
}

export { Player }
