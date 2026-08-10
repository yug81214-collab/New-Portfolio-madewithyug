import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { ShortForm } from "@/components/site/ShortForm";
import { LongForm } from "@/components/site/LongForm";
import { BeforeAfter } from "@/components/site/BeforeAfter";
import { Software } from "@/components/site/Software";
import { About } from "@/components/site/About";
import { Results } from "@/components/site/Results";
import { WhyMe } from "@/components/site/WhyMe";
import { Testimonials } from "@/components/site/Testimonials";
import { FAQ } from "@/components/site/FAQ";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { LoadingScreen } from "@/components/site/LoadingScreen";

const title = "Yug Jha — VSL Editor & Motion Graphics Artist";
const description =
  "VSL-first video editing: high-converting sales letters, retention-driven short form and cinematic long form edits with custom motion graphics.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <LoadingScreen />
      <Nav />
      <main>
        <Hero />
        <ShortForm />
        <LongForm />
        <BeforeAfter />
        <Software />
        <About />
        <Results />
        <WhyMe />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
