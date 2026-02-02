import type { Metadata } from "next";
import ClubContentWrapper from "./components/ClubContentWrapper";

export const metadata: Metadata = {
  title: "Benelux GAA | Gaelic Games in Belgium, Netherlands & Luxembourg",
  description:
    "Benelux GAA - Promoting Gaelic Games across Belgium, Netherlands, and Luxembourg. Join our community for hurling, football, and camogie in the heart of Europe.",
  icons: {
    icon: "/benelux-gaa-crest.png",
  },
};

export default function BeneluxGAALayout({
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
      <div className="benelux-gaa-standalone" style={{ marginTop: "-64px" }}>
        <ClubContentWrapper>{children}</ClubContentWrapper>
      </div>
    </>
  );
}
