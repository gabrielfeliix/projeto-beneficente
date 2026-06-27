"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?mode=signup");
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center font-display text-2xl font-black uppercase tracking-tighter">
      Redirecionando para a área de cadastro unificada...
    </div>
  );
}
