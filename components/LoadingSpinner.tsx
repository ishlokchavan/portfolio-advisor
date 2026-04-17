export default function LoadingSpinner() {
  return (
    <div className="flex justify-center p-8">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
    </div>
  );
}
