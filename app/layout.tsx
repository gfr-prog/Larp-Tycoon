import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "LARP TYCOON — From broke to bespoke.",
  description:
    "Dein Leben. Dein Business. Dein Imperium. Der virtuelle Multiplayer-Tycoon.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
