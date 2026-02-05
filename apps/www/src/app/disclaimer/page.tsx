import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

export const metadata: Metadata = {
  title: "免責事項 - surasura",
  description: "surasuraの免責事項について。サービスのご利用にあたっての注意事項です。",
};

export default function DisclaimerPage() {
  return <LegalPage type="disclaimer" />;
}
