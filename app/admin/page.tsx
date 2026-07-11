import { getEditableContent } from "@/lib/content";
import { logoutAction, saveContentAction } from "@/app/actions/content";
import AdminForm from "./AdminForm";

export default async function AdminPage() {
  const content = await getEditableContent();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-1">
              Admin
            </p>
            <h1 className="text-2xl font-bold text-white">Edit Content</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/scratchpad"
              className="font-mono text-xs text-muted-foreground hover:text-white transition-colors border border-neutral-800 hover:border-neutral-600 rounded px-3 py-1.5"
            >
              Scratchpad →
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-mono text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <AdminForm content={content} saveAction={saveContentAction} />
      </div>
    </main>
  );
}
