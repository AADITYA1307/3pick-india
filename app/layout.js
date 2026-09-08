import { Lato } from "next/font/google";
import "./globals.css";
import SiteHeader from "./SiteHeader";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata = {
  title: "3 Pick India — life interview, 3 cars, Decision Memo",
  description: "Short life interview, up to three cars, and a memo you can defend.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <SiteHeader />
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
