import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | PlayAway",
  description:
    "Learn about PlayAway's two product types: Team Ticket for tournaments and Player Day-Pass for individual team visits.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
