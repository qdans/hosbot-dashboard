"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href}>
            <div className={`px-4 py-2 text-lg font-medium border-b-2 transition-colors duration-200 ${
                isActive 
                    ? 'border-indigo-500 text-white' 
                    : 'border-transparent text-gray-400 hover:text-white'
            }`}>
                {children}
            </div>
        </Link>
    );
}