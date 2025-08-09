import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import MemberActionButtons from '@/app/components/MemberActionButtons';

type User = { id: string; username: string; discriminator: string; avatar: string | null; };
type Member = { user: User; roles: string[]; joined_at: string; nick: string | null; };

async function getGuildMembers(guildId: string): Promise<Member[]> {
    const response = await fetch(`https://discord.com/api/guilds/${guildId}/members?limit=1000`, {
        headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
        next: { revalidate: 10 }
    });
    if (!response.ok) {
        console.error("Failed to fetch members directly:", await response.text());
        return [];
    };
    return response.json();
}

export default async function MembersPage({ params }: { params: { guildId: string } }) {
    const session = await getServerSession(authOptions);
    const members = await getGuildMembers(params.guildId);

    if (!session || !session.user) {
        return <p>You must be logged in to view this page.</p>;
    }
    
    const moderator = { id: session.user.id, tag: session.user.tag };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Server Members ({members.length})</h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">User ID</th>
                            <th scope="col" className="px-6 py-3">Joined At</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.user.id} className="border-b bg-gray-800 border-gray-700 hover:bg-gray-600">
                                <th scope="row" className="flex items-center px-6 py-4 whitespace-nowrap text-white">
                                    <Image 
                                        className="w-10 h-10 rounded-full" 
                                        src={member.user.avatar ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : 'https://cdn.discordapp.com/embed/avatars/0.png'}
                                        alt={`${member.user.username} avatar`}
                                        width={40}
                                        height={40}
                                    />
                                    <div className="pl-3">
                                        <div className="text-base font-semibold">{member.nick || member.user.username}</div>
                                        <div className="font-normal text-gray-500">{member.user.username}#{member.user.discriminator}</div>
                                    </div>  
                                </th>
                                <td className="px-6 py-4">
                                    <code>{member.user.id}</code>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(member.joined_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    {member.user.id !== moderator.id &&
                                        <MemberActionButtons 
                                            guildId={params.guildId} 
                                            targetUserId={member.user.id}
                                            moderator={moderator}
                                        />
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}