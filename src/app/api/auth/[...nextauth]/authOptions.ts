import { AuthOptions } from "next-auth";
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        const discordProfile = profile as DiscordProfile;
        token.id = discordProfile.id;
        token.tag = `${discordProfile.username}#${discordProfile.discriminator}`;
      }
      return token;
    },
    async session({ session, token }) {
      if(session.user){
         session.accessToken = token.accessToken as string;
         session.user.id = token.id;
         session.user.tag = token.tag;
      }
      return session;
    },
  },
};