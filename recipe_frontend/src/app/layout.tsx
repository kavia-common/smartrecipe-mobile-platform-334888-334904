import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartRecipe",
  description:
    "Mobile-first recipe discovery, cooking, meal planning, shopping, and admin management experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
