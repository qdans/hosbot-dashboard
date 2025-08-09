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
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/guilds/${guildId}/channels`);
    if(!response.ok) {
        console.error(`Failed to fetch channels for guild ${guildId}`);
        return [];
    }
    return response.json();
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
            {/* We render the form only if settings are available, passing the data down */}
            {settings && <SettingsForm initialSettings={settings} guildId={guildId} channels={channels} />}
        </div>
    );
}