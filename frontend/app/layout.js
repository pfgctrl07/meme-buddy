import "./globals.css";

export const metadata = {
  title: "Meme Buddy",
  description: "AI-powered meme trend intelligence platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
