import type { Metadata } from "next";
import { listBoards } from "@/lib/boards";
import Whiteboard from "./Whiteboard";

export const metadata: Metadata = {
  title: "Scratchpad",
  robots: { index: false, follow: false },
};

export default async function BoardPage() {
  const boards = await listBoards();
  return <Whiteboard initialBoards={boards} />;
}
