import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sura2.net";

export const metadata: Metadata = {
  title: "外部サービス連携 - surasura",
  description:
    "surasuraが連携する外部サービスの一覧と、データの取り扱いについて。",
  openGraph: {
    title: "外部サービス連携 - surasura",
    description:
      "surasuraが連携する外部サービスの一覧と、データの取り扱いについて。",
    type: "website",
    url: `${baseUrl}/external-services`,
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
    title: "外部サービス連携 - surasura",
    description:
      "surasuraが連携する外部サービスの一覧と、データの取り扱いについて。",
    images: [`${baseUrl}/ogp.png`],
  },
};

export default function ExternalServicesPage() {
  return <LegalPage type="external-services" />;
}
