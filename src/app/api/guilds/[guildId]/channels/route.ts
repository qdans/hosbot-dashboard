import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

async function checkAdminPermissions(accessToken: string, guildId: string): Promise<boolean> {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return false;
    const guilds = await response.json();
    const currentGuild = guilds.find((g: any) => g.id === guildId);
    if (!currentGuild) return false;
    const permissions = BigInt(currentGuild.permissions);
    return (permissions & BigInt(0x8)) === BigInt(0x8);
}

export async function GET(
  request: Request,
  { params }: { params: { guildId: string } }
) {
  const session = await getServerSession(authOptions);
  const guildId = params.guildId;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await checkAdminPermissions(session.accessToken, guildId);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const response = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }

  const channels = await response.json();
  const textChannels = channels.filter((c: any) => c.type === 0);

  return NextResponse.json(textChannels);
}