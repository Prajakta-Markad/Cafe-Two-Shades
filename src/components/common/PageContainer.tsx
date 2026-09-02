import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-10 ${className}`}
    >
      {children}
    </div>
  );
}