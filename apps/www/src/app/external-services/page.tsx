import type { Metadata } from "next";
import { LegalPage } from "../../content/LegalPage";

export const metadata: Metadata = {
  title: "外部サービス連携 - surasura",
  description: "surasuraが連携する外部サービスの一覧と、データの取り扱いについて。",
};

export default function ExternalServicesPage() {
  return <LegalPage type="external-services" />;
}
