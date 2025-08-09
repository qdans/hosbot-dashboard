"use client";
import { useState } from 'react';
import { banMember, kickMember } from '@/app/actions';

interface Props {
    guildId: string;
    targetUserId: string;
    moderator: { id: string, tag: string };
}

export default function MemberActionButtons({ guildId, targetUserId, moderator }: Props) {
    const [loading, setLoading] = useState(false);

    const handleKick = async () => {
        if (confirm('Are you sure you want to kick this member?')) {
            setLoading(true);
            const reason = prompt("Please provide a reason for the kick (optional):") || "No reason provided.";
            const result = await kickMember(guildId, targetUserId, moderator, reason);
            if ('error' in result && result.error) {
                alert(`Error: ${result.error}`);
            }
            setLoading(false);
        }
    };

    const handleBan = async () => {
        if (confirm('Are you sure you want to BAN this member? This is a serious action.')) {
            setLoading(true);
            const reason = prompt("Please provide a reason for the ban (optional):") || "No reason provided.";
            const result = await banMember(guildId, targetUserId, moderator, reason);
            if ('error' in result && result.error) {
                alert(`Error: ${result.error}`);
            }
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button 
                onClick={handleKick} 
                disabled={loading}
                className="px-3 py-1 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:bg-gray-500"
            >
                Kick
            </button>
            <button 
                onClick={handleBan}
                disabled={loading}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-500"
            >
                Ban
            </button>
        </div>
    );
}