export default function EmptyState({ title, cta }: { title: string; cta?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center">
      <div className="text-4xl mb-2">📭</div>
      <div className="font-medium">{title}</div>
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}
