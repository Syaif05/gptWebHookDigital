import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration
 * - scope menyertakan gmail.send
 * - request refresh_token (access_type=offline + prompt=consent)
 * - taruh access_token ke session.accessToken (camelCase)
 */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Saat user baru login, NextAuth memberi 'account'
      if (account) {
        token.access_token = account.access_token || token.access_token;
        token.refresh_token = account.refresh_token || token.refresh_token;
        token.expires_at = account.expires_at || token.expires_at; // epoch seconds
      }
      return token;
    },
    async session({ session, token }) {
      // SIMPAN dengan nama 'accessToken' (camelCase) → disamakan dengan route API
      session.accessToken = token.access_token || null;
      if (session?.user?.email) {
        session.user.email = session.user.email.toLowerCase();
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
