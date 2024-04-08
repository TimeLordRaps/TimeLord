import Workspace from '../components/Workspace';

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-gray-800 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">timelord</h1>
      </header>
      <div className="container mx-auto py-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to timelord</h2>
        <p className="text-lg mb-8">timelord saves you time. Start by managing your files in the workspace below.</p>
        <Workspace />
      </div>
    </main>
  );
}