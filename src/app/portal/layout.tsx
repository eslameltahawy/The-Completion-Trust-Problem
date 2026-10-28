import { DemoBanner, PortalHeader } from "@/components/Chrome";

export const dynamic = "force-dynamic";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoBanner />
      <PortalHeader />
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </>
  );
}
