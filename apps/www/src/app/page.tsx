import { Header } from "../components/Header";
import { Hero } from "../components/sections/Hero";
import { UseCasesStack } from "../components/sections/UseCasesStack";
import { Pricing } from "../components/sections/Pricing";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Features } from "../components/sections/Features";
import { Footer } from "../components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <Hero />
        <UseCasesStack />
        <Pricing />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
