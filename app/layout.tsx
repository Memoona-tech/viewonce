import Snowfall from "./components/snowfall";
import "./globals.css";
import { ReactNode } from "react";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
       <Snowfall />
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
