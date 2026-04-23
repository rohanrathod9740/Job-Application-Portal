import "./globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "JobPortal | Hiring Without Friction",
  description: "A polished hiring workspace for candidates and recruiters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="text-[var(--foreground)] antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
