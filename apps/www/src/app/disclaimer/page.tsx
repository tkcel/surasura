import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  title: "免責事項 - surasura",
  description:
    "surasuraの免責事項について。サービスのご利用にあたっての注意事項です。",
  openGraph: {
    title: "免責事項 - surasura",
    description:
      "surasuraの免責事項について。サービスのご利用にあたっての注意事項です。",
    type: "website",
    url: `${baseUrl}/disclaimer`,
    siteName: "surasura",
    images: [
      {
        url: `${baseUrl}/ogp.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "免責事項 - surasura",
    description:
      "surasuraの免責事項について。サービスのご利用にあたっての注意事項です。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function DisclaimerPage() {
  return <LegalPage type="disclaimer" />;
}
