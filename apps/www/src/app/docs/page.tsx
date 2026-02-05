import type { Metadata } from "next";
import { GettingStarted } from "../../content/docs/GettingStarted";

export const metadata: Metadata = {
  title: "はじめに",
};

export default function DocsPage() {
  return <GettingStarted />;
}
