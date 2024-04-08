import Workspace from '../components/Workspace';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <section className="hero bg-gradient-to-r from-primary to-secondary text-white py-20 rounded-lg shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Welcome to timelord</h2>
            <p className="text-xl mb-8">timelord saves you time. Start by managing your files in the workspace below.</p>
            <button className="btn-primary text-lg px-6 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300">Get Started</button>
          </div>
        </section>
        <Workspace />
      </div>
    </main>
  );
}