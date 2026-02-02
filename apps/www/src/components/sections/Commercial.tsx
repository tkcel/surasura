import { Building2 } from "lucide-react";

export function Commercial() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              ビジネスでのご利用をお考えの方へ
            </h2>

            <p className="text-gray-300 leading-relaxed mb-8">
              surasuraは非商用ライセンスのため、商用利用には別途ライセンスが必要です。
              <br className="hidden md:block" />
              企業での導入、業務利用、商用サービスへの組み込みをご検討の方は、
              <br className="hidden md:block" />
              お気軽にお問い合わせください。
            </p>

            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              商用ライセンスについて問い合わせる
            </a>

            <p className="mt-6 text-sm text-gray-400">
              通常2〜3営業日以内にご連絡いたします
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
