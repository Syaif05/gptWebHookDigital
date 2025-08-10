import GoogleProvider from "next-auth/providers/google";

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
      // simpan token dari Google ke JWT
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token ?? token.refresh_token;
        token.expires_at = account.expires_at
          ? Date.now() + account.expires_at * 1000
          : token.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // expose ke client/server lewat session
      session.accessToken = token.access_token || null; // <— KONSISTEN camelCase
      session.user.email = session.user.email?.toLowerCase();
      return session;
    },
  },
};
