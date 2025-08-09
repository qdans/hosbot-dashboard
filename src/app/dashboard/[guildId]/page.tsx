import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { notFound } from "next/navigation";
import supabase from "@/app/utils/supabaseClient";
import SettingsForm from "@/app/components/SettingsForm";

type Guild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

async function checkAdminPermissions(accessToken: string, guildId: string): Promise<boolean> {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return false;

    const guilds: Guild[] = await response.json();
    const currentGuild = guilds.find(g => g.id === guildId);

    if (!currentGuild) return false;

    const permissions = BigInt(currentGuild.permissions);
    return (permissions & BigInt(0x8)) === BigInt(0x8);
}

async function getGuildSettings(guildId: string) {
    const { data, error } = await supabase
        .from('guild_settings')
        .select('*')
        .eq('guild_id', guildId)
        .single();

    if (error && error.code === 'PGRST116') {
        return {
            guild_id: guildId,
            welcome_message_text: '',
            welcome_channel_id: '',
            welcome_message_enabled: true
        };
    }
    return data;
}

export default async function ServerDashboardPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return notFound();
    }

    const isAdmin = await checkAdminPermissions(session.accessToken, params.guildId);
    if (!isAdmin) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
                <h1 className="text-2xl">You do not have permission to view this page.</h1>
            </div>
        );
    }

    const settings = await getGuildSettings(params.guildId);

    return (
        <main className="flex min-h-screen flex-col items-center p-8 bg-gray-900 text-white">
            <div className="w-full max-w-4xl p-8 rounded-xl bg-gray-800 shadow-2xl">
                <h1 className="text-4xl font-bold mb-6">Server Settings</h1>
                <p className="text-gray-400 mb-8">
                    Configure Hosbot for your server. Changes saved here will be instantly applied.
                </p>
                {settings && <SettingsForm initialSettings={settings} guildId={params.guildId} />}
            </div>
        </main>
    );
}