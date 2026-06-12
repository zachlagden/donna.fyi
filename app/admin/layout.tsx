import { Nav } from "@/components/nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark surface-terminal bg-surface texture-grid min-h-screen">
      <Nav variant="blog" />
      {children}
    </div>
  );
}
