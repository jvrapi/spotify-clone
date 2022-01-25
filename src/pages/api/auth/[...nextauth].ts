import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import SpotifyProvider from 'next-auth/providers/spotify'

import spotifyApi, { LOGIN_URL } from '../../../lib/spotify'

const refreshAccessToken = async (token: JWT) => {
  try {
    spotifyApi.setAccessToken(token.acessToken as string)
    spotifyApi.setRefreshToken(token.refreshToken as string)
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken()

    // console.log('REFRESHED TOKEN IS ', refreshedToken)

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000, // 1 hour as 3600 return from spotify api
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      // Replace is new one came back elese fall back to old refresh token
    }
  } catch (error) {
    console.log(error)
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    }
  }
}

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000, // we are handling expiry times in Miliseconds hence * 1000
        }
      }

      // Return previous token if the token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        // console.log('EXISTING ACCESS TOKEN IS VALID')
        return token
      }

      // Access token has expired, so we need to refresh it...
      return await refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.name = token.name
      session.user.email = token.email
      session.user.image = token.picture
      session.accessToken = token.accessToken
      session.refreshToken = token.accessToken
      session.username = token.username

      return session
    },
  },
})
