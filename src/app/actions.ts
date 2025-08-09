"use server";
import supabase from "@/app/utils/supabaseClient";
import { revalidatePath } from "next/cache";

export async function updateGuildSettings(guildId: string, formData: FormData) {
    const welcomeMessage = formData.get('welcome_message') as string;
    const welcomeChannelId = formData.get('welcome_channel') as string | null;
    const welcomeEnabled = formData.get('welcome_enabled') === 'on';

    const { error } = await supabase
        .from('guild_settings')
        .upsert({
            guild_id: guildId,
            welcome_message_text: welcomeMessage,
            welcome_channel_id: welcomeChannelId,
            welcome_message_enabled: welcomeEnabled,
        }, {
            onConflict: 'guild_id'
        });

    if (error) {
        console.error('Supabase error:', error);
        return { success: false, error: error.message };
    }
    
    revalidatePath(`/dashboard/${guildId}`);
    return { success: true };
}