import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rome Hibernia GAA | The Home of Gaelic Games in Rome",
  description:
    "Rome Hibernia GAA - The home of Gaelic Games in Rome. Join our community for hurling, football, and camogie in the heart of Italy.",
  icons: {
    icon: "/club-crests/rome-hibernia-NEW.png",
  },
};

export default function RomeHiberniaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        body > main + footer,
        body > main ~ footer {
          display: none !important;
        }
        header:has(nav a[href="/clubs"]) {
          display: none !important;
        }
        main.pt-16 {
          padding-top: 0 !important;
        }
      `}</style>
      <div className="rome-hibernia-standalone" style={{ marginTop: "-64px" }}>
        {children}
      </div>
    </>
  );
}
