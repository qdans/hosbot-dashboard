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

async function performModerationAction(
    guildId: string, 
    targetUserId: string, 
    moderator: { id: string, tag: string }, 
    action: 'kick' | 'ban', 
    reason: string
) {
    const endpoint = action === 'kick' 
        ? `https://discord.com/api/guilds/${guildId}/members/${targetUserId}`
        : `https://discord.com/api/guilds/${guildId}/bans/${targetUserId}`;
        
    const method = action === 'kick' ? 'DELETE' : 'PUT';
    const body = action === 'ban' ? JSON.stringify({ reason }) : undefined;

    const response = await fetch(endpoint, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            'X-Audit-Log-Reason': reason,
        },
        body: body,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error(`Failed to ${action} member:`, error);
        throw new Error(`Failed to ${action} member. Check bot permissions.`);
    }

    console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} action logged for ${targetUserId} by ${moderator.tag}`);
    
    revalidatePath(`/dashboard/${guildId}/members`);
    return { success: true };
}

export async function kickMember(guildId: string, targetUserId: string, moderator: { id: string, tag: string }, reason: string) {
    try {
        return await performModerationAction(guildId, targetUserId, moderator, 'kick', reason);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function banMember(guildId: string, targetUserId: string, moderator: { id: string, tag: string }, reason: string) {
    try {
        return await performModerationAction(guildId, targetUserId, moderator, 'ban', reason);
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}