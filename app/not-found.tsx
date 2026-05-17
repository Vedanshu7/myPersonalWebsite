import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-8xl font-bold text-white/10 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="rounded-full font-mono text-sm">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
