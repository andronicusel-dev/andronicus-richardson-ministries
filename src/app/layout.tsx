import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource/marcellus/latin-400.css";
import "@fontsource-variable/eb-garamond/index.css";
import "@fontsource-variable/eb-garamond/wght-italic.css";
import "@fontsource-variable/source-sans-3/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Andronicus Richardson Ministries",
    template: "%s · Andronicus Richardson Ministries",
  },
  description:
    "Andronicus Richardson Ministries: service times, sermons, upcoming events, prayer requests and giving.",
  openGraph: {
    title: "Andronicus Richardson Ministries",
    description: "Come as you are. Worship with us, hear the Word, and let us pray with you.",
    type: "website",
    siteName: "Andronicus Richardson Ministries",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1c12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
