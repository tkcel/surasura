import { notFound } from "next/navigation";
import { docsSections, type DocsSectionId } from "../../../content/docs/config";
import { GettingStarted } from "../../../content/docs/GettingStarted";
import { Presets } from "../../../content/docs/Presets";
import { Dictionary } from "../../../content/docs/Dictionary";
import { History } from "../../../content/docs/History";
import { Settings } from "../../../content/docs/Settings";
import { FAQ } from "../../../content/docs/FAQ";
import { Troubleshooting } from "../../../content/docs/Troubleshooting";

const sectionComponents: Record<DocsSectionId, React.ComponentType> = {
  "getting-started": GettingStarted,
  presets: Presets,
  dictionary: Dictionary,
  history: History,
  settings: Settings,
  faq: FAQ,
  troubleshooting: Troubleshooting,
};

function isValidSectionId(id: string): id is DocsSectionId {
  return docsSections.some((s) => s.id === id);
}

export function generateStaticParams() {
  return docsSections
    .filter((s) => s.id !== "getting-started")
    .map((s) => ({ section: s.id }));
}

export default async function DocsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isValidSectionId(section)) {
    notFound();
  }

  const SectionComponent = sectionComponents[section];
  return <SectionComponent />;
}
