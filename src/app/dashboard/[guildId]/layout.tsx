import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavLink from "@/app/components/NavLink";

type Guild = {
  id: string;
  name: string;
  icon: string | null;
};

async function getGuildInfo(accessToken: string, guildId: string): Promise<Guild | null> {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 60 }
    });
    if (!response.ok) return null;

    const guilds: Guild[] = await response.json();
    return guilds.find(g => g.id === guildId) || null;
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { guildId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return notFound();
  }

  const guild = await getGuildInfo(session.accessToken, params.guildId);
  if (!guild) {
    return notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        {/* Server Header */}
        <div className="flex items-center gap-4 mb-6">
          {guild.icon ? (
            <Image
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              alt={`${guild.name} icon`}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
              {guild.name.charAt(0)}
            </div>
          )}
          <h1 className="text-4xl font-bold">{guild.name}</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <NavLink href={`/dashboard/${params.guildId}`}>Settings</NavLink>
          <NavLink href={`/dashboard/${params.guildId}/members`}>Members</NavLink>
        </div>

        {/* Page Content */}
        <div className="p-8 rounded-xl bg-gray-800 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}