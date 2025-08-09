import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import Image from "next/image";
import Link from "next/link";

type Guild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

async function getUserGuilds(accessToken: string) {
  const response = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch guilds");
    return [];
  }

  const guilds: Guild[] = await response.json();
  return guilds.filter(guild => {
    const permissions = BigInt(guild.permissions);
    return (permissions & BigInt(0x8)) === BigInt(0x8);
  });
}

export default async function Home() {
  const session = await getServerSession(authOptions);
  let guilds: Guild[] = [];

  if (session && session.accessToken) {
    guilds = await getUserGuilds(session.accessToken);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-4xl text-center p-8 rounded-xl bg-gray-800 shadow-2xl">
        <h1 className="text-5xl font-bold mb-6">Hosbot Dashboard</h1>
        
        {session ? (
          <div>
            <div className="flex flex-col items-center mb-8">
              <p className="mb-4 text-xl">
                Welcome, <span className="font-bold text-indigo-400">{session.user?.name}</span>!
              </p>
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="User Avatar"
                  width={80}
                  height={80}
                  className="rounded-full mx-auto mb-6 border-4 border-indigo-500"
                />
              )}
              <SignOutButton />
            </div>

            <hr className="border-gray-600 my-6"/>

            <h2 className="text-3xl font-bold mb-4">Your Servers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {guilds.length > 0 ? (
                guilds.map((guild) => (
                  <Link key={guild.id} href={`/dashboard/${guild.id}`}>
                    <div className="bg-gray-700 p-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200 flex flex-col items-center">
                      {guild.icon ? (
                        <Image
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt={`${guild.name} icon`}
                          width={64}
                          height={64}
                          className="rounded-full mb-2"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-600 mb-2 flex items-center justify-center text-2xl font-bold">
                          {guild.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-semibold text-center">{guild.name}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p>No servers found where you are an administrator.</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-6 text-lg">Please sign in to manage your servers.</p>
            <SignInButton />
          </div>
        )}
      </div>
    </main>
  );
}