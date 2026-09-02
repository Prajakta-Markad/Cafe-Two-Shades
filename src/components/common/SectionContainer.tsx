import type { ReactNode } from "react";
import PageContainer from "./PageContainer";

interface SectionContainerProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export default function SectionContainer({
  children,
  id,
  className = "",
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${className}`}
    >
      <PageContainer>{children}</PageContainer>
    </section>
  );
}