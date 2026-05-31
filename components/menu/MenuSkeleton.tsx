"use client";

export default function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 animate-pulse"
        >
          <div className="h-44 bg-zinc-800" />
          <div className="p-4 space-y-2.5">
            <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
            <div className="h-3 bg-zinc-800 rounded-full w-full" />
            <div className="h-3 bg-zinc-800 rounded-full w-2/3" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-6 bg-zinc-800 rounded-full w-16" />
              <div className="h-8 bg-zinc-800 rounded-full w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
