import { atom } from 'recoil'

const playlistState = atom({
  key: 'playlistState',
  default: null,
})

const playlistIdState = atom({
  key: 'playlistIdState',
  default: '1JKYPLjz3BTMGXvVUHi1HL',
})

export { playlistIdState, playlistState }
