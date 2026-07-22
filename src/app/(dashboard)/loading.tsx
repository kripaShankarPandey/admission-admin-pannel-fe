/**
 * Covers every dashboard route while its data loads. The admin panel fetches
 * on the client, so this only shows during the route transition itself — but
 * that is exactly the moment a click otherwise feels ignored.
 */
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-56 rounded-lg" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );
}
