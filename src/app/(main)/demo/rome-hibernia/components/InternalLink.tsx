"use client";

import Link from "next/link";
import { useBasePath } from "../hooks/useBasePath";
import { ReactNode } from "react";

interface InternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export default function InternalLink({
  href,
  className,
  children,
}: InternalLinkProps) {
  const { basePath } = useBasePath();

  const fullHref = href === "/" ? basePath || "/" : `${basePath}${href}`;

  return (
    <Link href={fullHref} className={className}>
      {children}
    </Link>
  );
}
