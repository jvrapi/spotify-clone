import { atom } from 'recoil'

const currentTrackIdState = atom({
  key: 'CurrentTrackIdState',
  default: null,
})

const isPlayingState = atom({
  key: 'isPlayingState',
  default: false,
})

export { currentTrackIdState, isPlayingState }
