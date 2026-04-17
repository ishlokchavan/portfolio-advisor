import Sidebar from './Sidebar';
import MobileTabNav from './MobileTabNav';
import Navbar from './Navbar';
import InstallPrompt from './InstallPrompt';

export default function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl w-full mx-auto">
          {children}
        </main>
        <MobileTabNav />
        <InstallPrompt />
      </div>
    </div>
  );
}
