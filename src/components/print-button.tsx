"use client";

import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function PrintButton({ className, size = "lg" }: PrintButtonProps) {
  return (
    <Button
      onClick={() => typeof window !== "undefined" && window.print()}
      size={size}
      className={className}
    >
      🖨️ Imprimir Certificado
    </Button>
  );
}
