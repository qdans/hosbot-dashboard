"use client";
import { useState } from 'react';
import { updateGuildSettings } from '@/app/actions';

interface Settings {
    guild_id: string;
    welcome_message_text: string | null;
    welcome_channel_id: string | null;
    welcome_message_enabled: boolean | null;
}

export default function SettingsForm({ initialSettings, guildId }: { initialSettings: Settings, guildId: string }) {
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
            <div className="mb-6">
                <label htmlFor="welcome_message" className="block mb-2 text-sm font-medium text-gray-300">
                    Welcome Message
                </label>
                <textarea
                    id="welcome_message"
                    name="welcome_message"
                    rows={4}
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                    placeholder="Welcome {user} to {server}! Use {username} for their tag."
                    defaultValue={initialSettings.welcome_message_text || ''}
                />
                <p className="mt-2 text-xs text-gray-400">
                    This message will be sent to the channel you configured with the /setup command in Discord.
                </p>
            </div>

            <div className="flex items-center space-x-4">
                <button
                    type="submit"
                    className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Save Settings
                </button>
                {status && <p className="text-sm text-gray-400">{status}</p>}
            </div>
        </form>
    );
}