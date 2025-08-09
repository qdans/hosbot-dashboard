import supabase from "@/app/utils/supabaseClient";
import SettingsForm from "@/app/components/SettingsForm";

type Channel = {
  id: string;
  name: string;
  type: number;
};

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
            welcome_channel_id: null,
            welcome_message_enabled: false
        };
    }
    return data;
}

async function getGuildChannels(guildId: string): Promise<Channel[]> {
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
        next: { revalidate: 60 }
    });
    if(!response.ok) return [];
    const allChannels: Channel[] = await response.json();
    return allChannels.filter(c => c.type === 0);
}

export default async function SettingsPage({ params }: { params: { guildId: string } }) {
    const { guildId } = params;
    const [settings, channels] = await Promise.all([
        getGuildSettings(guildId),
        getGuildChannels(guildId)
    ]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">General Settings</h1>
            {settings && <SettingsForm initialSettings={settings} guildId={guildId} channels={channels} />}
        </div>
    );
}