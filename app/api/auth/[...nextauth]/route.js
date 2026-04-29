import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("No user found");
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");
        
        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
      }

      // Handle session updates (e.g., after profile edit)
      if (token.updatedUser) {
        token.phone = token.updatedUser.phone;
        token.address = token.updatedUser.address;
        delete token.updatedUser;
      }

      return token;
    },

    async session({ session, token }) {
      await dbConnect();
      // .lean() makes the query faster by returning a plain JS object
      const freshUser = await User.findById(token.id).lean();

      if (freshUser) {
        session.user.id = token.id;
        session.user.role = freshUser.role;
        session.user.phone = freshUser.phone || "";
        session.user.address = freshUser.address || "";
        session.user.name = freshUser.name;
        session.user.email = freshUser.email;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };