export default function Navbar({ title }: { title: string }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
      <h1 className="font-semibold text-lg">{title}</h1>
    </header>
  );
}
