import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NavLink from "@/app/components/NavLink";
import { ReactNode } from "react";

type Guild = { id: string; name: string; icon: string | null; };
type Channel = { id: string; name: string; type: number; };

async function getGuildData(accessToken: string, guildId: string): Promise<{ guild: Guild | null, channels: Channel[] }> {
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 60 }
    });
    if (!guildsResponse.ok) return { guild: null, channels: [] };
    const guilds: Guild[] = await guildsResponse.json();
    const guild = guilds.find(g => g.id === guildId) || null;

    const channelsResponse = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
        next: { revalidate: 60 }
    });
    if (!channelsResponse.ok) return { guild, channels: [] };
    const allChannels: Channel[] = await channelsResponse.json();
    const textChannels = allChannels.filter(c => c.type === 0);

    return { guild, channels: textChannels };
}
interface DashboardLayoutProps {
  children: ReactNode;
  params: { guildId: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return notFound();
  }

  const { guild, channels } = await getGuildData(session.accessToken, params.guildId);
  if (!guild) {
    return notFound();
  }

  const childrenWithProps = require('react').cloneElement(children as React.ReactElement, { channels });

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          {guild.icon ? (
            <Image src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={`${guild.name} icon`} width={64} height={64} className="rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">{guild.name.charAt(0)}</div>
          )}
          <h1 className="text-4xl font-bold">{guild.name}</h1>
        </div>
        <div className="flex border-b border-gray-700 mb-8">
          <NavLink href={`/dashboard/${params.guildId}`}>Settings</NavLink>
          <NavLink href={`/dashboard/${params.guildId}/members`}>Members</NavLink>
        </div>
        <div className="p-8 rounded-xl bg-gray-800 shadow-2xl">
          {childrenWithProps}
        </div>
      </div>
    </div>
  );
}