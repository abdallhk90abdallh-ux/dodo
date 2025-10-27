import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect";
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
    /** attach everything you need to JWT */
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id;
        token.role = user.role;
        token.phone = user.phone;
        token.address = user.address;
      }

      // when user calls session.update(), merge updates
      if (token.updatedUser) {
        token.phone = token.updatedUser.phone;
        token.address = token.updatedUser.address;
        delete token.updatedUser;
      }

      return token;
    },

    /** fetch the latest user from DB each time a session is created */
    async session({ session, token }) {
      await dbConnect();
      const freshUser = await User.findById(token.id).lean();

      session.user.id = token.id;
      session.user.role = freshUser.role;
      session.user.phone = freshUser.phone || "";
      session.user.address = freshUser.address || "";
      session.user.name = freshUser.name;
      session.user.email = freshUser.email;

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
