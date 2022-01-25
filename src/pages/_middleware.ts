import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const middleware = async (req) => {
  // Token will exist if user is logged in
  const token = await getToken({ req, secret: process.env.JWT_SECRET })

  const { pathname } = req.nextUrl

  // Redirect user if token exists and they try access login page
  if (token && pathname === '/login') {
    return NextResponse.redirect('/')
  }

  // allow the requests if the folloing is true
  // 1) Its a request for next-auth session & provider fetching
  // 2) the token exits
  if (pathname.includes('/api/auth') || token) {
    return NextResponse.next()
  }

  // Redirect them to login if they dont have token AND are requesting a protected route
  if (!token && pathname !== '/login') {
    return NextResponse.redirect('/login')
  }
}

export { middleware }
