import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'moda-berliner-super-secret-key-123',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Kullanıcı Adı", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'berliner2026';

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          return { id: "1", name: "Admin", email: "admin@modaberliner.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: "jwt",
  },
});
