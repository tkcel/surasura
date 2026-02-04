import { useState } from "react";
import { Menu, X } from "lucide-react";
import { DocsSidebar } from "./DocsSidebar";

export function DocsMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-nm-surface shadow-nm-raised-md rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        aria-label="メニューを開く"
      >
        <Menu size={24} />
      </button>

      {/* ドロワーオーバーレイ */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* ドロワー本体 */}
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-nm-surface p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">ドキュメント</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="メニューを閉じる"
              >
                <X size={20} />
              </button>
            </div>

            {/* ナビゲーション */}
            <DocsSidebar onNavigate={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
