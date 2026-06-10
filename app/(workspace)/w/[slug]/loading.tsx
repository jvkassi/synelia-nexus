export default function WorkspaceLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-8 py-10">
      <div className="mb-3 h-9 w-64 rounded-md bg-foreground/10" />
      <div className="mb-8 h-4 w-96 rounded-md bg-foreground/[0.06]" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {["a", "b", "c", "d"].map((k) => (
            <div className="h-40 rounded-lg bg-foreground/[0.06]" key={k} />
          ))}
        </div>
        <div className="h-80 rounded-lg bg-foreground/[0.06]" />
      </div>
    </div>
  );
}
