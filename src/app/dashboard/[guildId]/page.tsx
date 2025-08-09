import supabase from "@/app/utils/supabaseClient";
import SettingsForm from "@/app/components/SettingsForm";

type Channel = { id: string; name: string; };

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

export default async function SettingsPage({ params, channels }: { params: { guildId: string }, channels: Channel[] }) {
    const { guildId } = params;
    const settings = await getGuildSettings(guildId);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">General Settings</h1>
            {settings && <SettingsForm initialSettings={settings} guildId={guildId} channels={channels} />}
        </div>
    );
}