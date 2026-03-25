"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReleaseNote } from "../../lib/releases";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ReleaseCard({
  release,
  defaultOpen,
}: {
  release: ReleaseNote;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl shadow-nm-raised-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-900 font-mono">
            v{release.version}
          </span>
          <span className="text-sm text-gray-500">
            {formatDate(release.date)}
          </span>
          {release.summary && (
            <span className="hidden sm:inline text-sm text-gray-600">
              — {release.summary}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {release.summary && (
            <p className="sm:hidden text-sm text-gray-600 mt-3 mb-2">
              {release.summary}
            </p>
          )}
          <div className="prose prose-sm prose-gray max-w-none mt-4 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>ul]:mt-1 [&>ul]:mb-3 [&>ul>li]:text-sm">
            <ReactMarkdown>{release.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReleaseList({ releases }: { releases: ReleaseNote[] }) {
  if (releases.length === 0) {
    return (
      <p className="text-gray-500 text-center py-12">
        リリースノートはまだありません。
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {releases.map((release, index) => (
        <ReleaseCard
          key={release.version}
          release={release}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}
