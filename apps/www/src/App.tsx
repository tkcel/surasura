import { Header } from "./components/Header";
import { Hero } from "./components/sections/Hero";
import { Pricing } from "./components/sections/Pricing";
import { HowItWorks } from "./components/sections/HowItWorks";
import { Features } from "./components/sections/Features";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main>
        <Hero />
        <Pricing />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}

export default App;
