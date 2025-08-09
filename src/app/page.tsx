import { getServerSession } from "next-auth";
import { SignInButton, SignOutButton } from "./components/AuthButtons";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="text-center p-8 rounded-xl bg-gray-800 shadow-2xl">
        <h1 className="text-5xl font-bold mb-6">Hosbot Dashboard</h1>
        {session ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-xl">
              Welcome, <span className="font-bold text-indigo-400">{session.user?.name}</span>!
            </p>
            {session.user?.image && (
                <Image 
                    src={session.user.image} 
                    alt="User Avatar" 
                    width={80}
                    height={80}
                    className="rounded-full mx-auto mb-6 border-4 border-indigo-500" 
                />
            )}
            <SignOutButton />
          </div>
        ) : (
          <div>
            <p className="mb-6 text-lg">Please sign in to manage your servers.</p>
            <SignInButton />
          </div>
        )}
      </div>
    </main>
  );
}