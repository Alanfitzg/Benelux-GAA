import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GGE Social | Gaelic Games Europe Recreational Games",
  description:
    "Register for Gaelic Games Europe recreational events - Dads & Lads, Gaelic4Mothers&Others, and Social Camogie across Europe.",
  icons: {
    icon: "/images/gge-crest.png",
  },
};

export default function GGELayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gge-standalone" style={{ marginTop: "-64px" }}>
      {children}
    </div>
  );
}
