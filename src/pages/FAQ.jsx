import React from "react";
import SectionHeading from "../components/ui/SectionHeading";
import FaqList from "../components/ui/FaqList";
import CTASection from "../components/ui/CTASection";
import RevealOnScroll from "../components/motion/RevealOnScroll";
import { FAQ_GROUPS } from "../data/faqs";

export default function FAQ() {
  return (
    <>
      <section className="container-page max-w-3xl pb-8 pt-32 md:pt-40">
        <SectionHeading as="h1" eyebrow="Help center" title={<><span className="hl">Questions?</span></>}>
          Quick answers about how res agents work, how your data is handled, and how billing works.
        </SectionHeading>

        <div className="mt-16 space-y-14">
          {FAQ_GROUPS.map((g, i) => (
            <RevealOnScroll key={g.title}>
              <h2 className="mb-5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-subtle">{g.title}</h2>
              <FaqList items={g.items} defaultOpen={i === 0 ? 0 : -1} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <CTASection
        title="Didn't find your answer?"
        body="Our team replies within one business day, usually much faster."
        primary={{ to: "/contact", label: "Contact us" }}
        secondary={{ to: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
