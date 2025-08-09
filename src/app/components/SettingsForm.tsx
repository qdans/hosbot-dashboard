"use client";
import { useState } from 'react';
import { updateGuildSettings } from '@/app/actions';

interface Settings {
    guild_id: string;
    welcome_message_text: string | null;
    welcome_channel_id: string | null;
    welcome_message_enabled: boolean | null;
    log_channel_id: string | null;
}

interface Channel {
    id: string;
    name: string;
}

export default function SettingsForm({ initialSettings, guildId, channels }: { initialSettings: Settings, guildId: string, channels: Channel[] }) {
    const [status, setStatus] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('Saving...');
        const formData = new FormData(event.currentTarget);
        const result = await updateGuildSettings(guildId, formData);
        
        if (result.success) {
            setStatus('Settings saved successfully!');
        } else {
            setStatus(`Error: ${result.error}`);
        }
        setTimeout(() => setStatus(''), 3000);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {/* Welcome Settings Section */}
            <div className="p-4 rounded-lg bg-gray-700/50 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Welcome Message</h3>
                
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="welcome_enabled" className="text-sm font-medium text-gray-300">
                        Enable Welcome Messages
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            id="welcome_enabled"
                            name="welcome_enabled"
                            className="sr-only peer" 
                            defaultChecked={initialSettings.welcome_message_enabled || false}
                        />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="mb-4">
                    <label htmlFor="welcome_channel" className="block mb-2 text-sm font-medium text-gray-300">
                        Welcome Channel
                    </label>
                    <select
                        id="welcome_channel"
                        name="welcome_channel"
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        defaultValue={initialSettings.welcome_channel_id || ''}
                    >
                        <option value="">Select a channel</option>
                        {channels.map(channel => (
                            <option key={channel.id} value={channel.id}># {channel.name}</option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <label htmlFor="welcome_message" className="block mb-2 text-sm font-medium text-gray-300">
                        Welcome Message Text
                    </label>
                    <textarea
                        id="welcome_message"
                        name="welcome_message"
                        rows={4}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        placeholder="Welcome {user} to {server}! Use {username} for their tag."
                        defaultValue={initialSettings.welcome_message_text || ''}
                    />
                </div>
            </div>

            {/* Moderation Log Settings */}
            <div className="p-4 rounded-lg bg-gray-700/50 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Moderation Logs</h3>
                <div className="mb-4">
                    <label htmlFor="log_channel" className="block mb-2 text-sm font-medium text-gray-300">
                        Log Channel
                    </label>
                    <select
                        id="log_channel"
                        name="log_channel"
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        defaultValue={initialSettings.log_channel_id || ''}
                    >
                        <option value="">Disable Logging</option>
                        {channels.map(channel => (
                            <option key={channel.id} value={channel.id}># {channel.name}</option>
                        ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-400">
                        All moderation actions (kick, ban, mute) will be logged in this channel.
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center space-x-4">
                <button
                    type="submit"
                    className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Save All Settings
                </button>
                {status && <p className="text-sm text-gray-400">{status}</p>}
            </div>
        </form>
    );
}