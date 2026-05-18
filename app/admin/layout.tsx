import { Nav } from "@/components/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern">
      <Nav variant="blog" />
      {children}
    </div>
  );
}
