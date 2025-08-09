import { withAuth } from "next-auth/middleware"

export default withAuth({
    // Matches the pages config in `[...nextauth]`
    pages: {
        signIn: '/api/auth/signin',
    }
})

export const config = {
    matcher: [
        "/playlist",
        "/track/upload",
        "/like"
    ]
}
