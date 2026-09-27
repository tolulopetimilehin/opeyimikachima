import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowRight, Check, Copy, ExternalLink, Heart, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitRsvp } from "@/lib/rsvp.functions";
import { wedding } from "@/lib/wedding";
import gardenHero from "@/assets/garden-hero.jpg";
import storyOne from "@/assets/IMG_4409.jpg.asset.json";
import storyTwo from "@/assets/IMG_4411.jpg.asset.json";
import storyThree from "@/assets/IMG_4410.jpg.asset.json";
import storyFour from "@/assets/IMG_4377.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Chima & Opeyimika | November 28, 2026" },
    { name: "description", content: "Celebrate Chima and Opeyimika at RCCG The Berean Centre, Ojota, Lagos on November 28, 2026 at 11 AM. Send your RSVP." },
    { property: "og:title", content: "Chima & Opeyimika | November 28, 2026" },
    { property: "og:description", content: "Celebrate with us at RCCG The Berean Centre, Ojota, Lagos. November 28, 2026 at 11 AM." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: `https://chimaopeyimika.lovable.app${storyTwo.url}` },
    { name: "twitter:image", content: `https://chimaopeyimika.lovable.app${storyTwo.url}` },
  ] }),
  component: WeddingPage,
});

type Choice = "yes" | "no";

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) => element.classList.add("revealed"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function Countdown() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(wedding.date).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const values = remaining === null ? ["--", "--", "--", "--"] : [
    Math.floor(remaining / 86400000),
    Math.floor((remaining / 3600000) % 24),
    Math.floor((remaining / 60000) % 60),
    Math.floor((remaining / 1000) % 60),
  ].map((value) => typeof value === "number" ? String(value).padStart(2, "0") : value);
  return <div className="grid grid-cols-4 gap-2 sm:gap-6" aria-label="Countdown to the wedding">
    {values.map((value, index) => <div key={index} className="text-center"><span className="font-display text-4xl sm:text-5xl leading-none tabular-nums">{value}</span><span className="mt-1 block eyebrow text-muted-foreground !text-[9px]">{["Days", "Hours", "Minutes", "Seconds"][index]}</span></div>)}
  </div>;
}

function RsvpForm() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [replied, setReplied] = useState<Choice | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("wedding-rsvp") ?? "null");
      if (saved?.name && (saved?.choice === "yes" || saved?.choice === "no")) {
        setName(saved.name); setEmail(saved.email ?? ""); setChoice(saved.choice); setReplied(saved.choice);
        if (saved.choice === "yes" && saved?.code) setCode(saved.code);
      }
    } catch { /* ignore */ }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!choice || !name.trim() || pending) return;
    setError("");
    setPending(true);
    try {
      const result = await submitRsvp({ data: { name: name.trim(), email: email.trim(), response: choice, website } });
      try {
        const saved = choice === "yes"
          ? { name: name.trim(), email: email.trim(), choice, code: result.accessCode }
          : { name: name.trim(), email: email.trim(), choice };
        window.localStorage.setItem("wedding-rsvp", JSON.stringify(saved));
      } catch { /* ignore */ }
      setCode(choice === "yes" ? result.accessCode : null);
      setReplied(choice);
      if (choice === "yes") setConfirmationOpen(true);
    } catch {
      setError("Your RSVP couldn't be sent. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function changeResponse() {
    setReplied(null); setCode(null); setChoice(null);
    try { window.localStorage.removeItem("wedding-rsvp"); } catch { /* ignore */ }
  }

  async function copyCode() {
    if (!code) return;
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }

  useEffect(() => {
    if (!confirmationOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setConfirmationOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmationOpen]);

  return <section id="rsvp" className="scroll-mt-6" data-reveal>
    <div className="invitation-card rounded-lg p-6 sm:p-8 lg:p-9">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div><p className="eyebrow text-rose">The invitation</p><h2 className="font-display mt-1 text-4xl sm:text-5xl leading-none">Will you join us?</h2></div>
        <Heart className="mt-1 size-6 shrink-0 text-rose" strokeWidth={1.3} aria-hidden="true" />
      </div>
      {code ? <div className="animate-in fade-in duration-500" role="status">
        <div className="border-t border-border pt-6"><p className="font-display text-3xl">Thank you, {name.trim()}.</p><p className="mt-2 text-sm text-muted-foreground">{choice === "no" ? "We've received your reply. You'll be missed." : "We've received your reply. We can't wait to celebrate with you."}</p></div>
        {choice !== "no" && <div className="mt-7 rounded-md bg-secondary p-5"><p className="eyebrow text-primary">Your guest access code</p><div className="mt-3 flex items-center justify-between gap-2"><strong className="font-display text-3xl sm:text-4xl tracking-widest text-foreground">{code}</strong><Button type="button" variant="iconSoft" size="icon" onClick={copyCode} aria-label={copied ? "Copied" : "Copy access code"} title="Copy access code">{copied ? <Check /> : <Copy />}</Button></div><p className="mt-3 text-xs text-muted-foreground">Keep this code, you'll need it at the door.</p></div>}
      </div> : <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset><legend className="mb-2 text-sm font-medium">Your response</legend><div className="grid grid-cols-3 gap-2">{([['yes', "I'll be there"], ['maybe', 'Maybe'], ['no', "Can't make it"]] as const).map(([value, label]) => <Button key={value} type="button" variant="choice" data-selected={choice === value} aria-pressed={choice === value} onClick={() => setChoice(value)} className="h-12 w-full whitespace-normal px-1 text-xs sm:text-sm leading-tight">{label}</Button>)}</div></fieldset>
        <div><label htmlFor="guest-name" className="mb-2 block text-sm font-medium">Full name <span className="text-rose">*</span></label><input id="guest-name" className="field" type="text" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} /></div>
        <div><label htmlFor="guest-email" className="mb-2 block text-sm font-medium">Email <span className="font-normal text-muted-foreground">(optional)</span></label><input id="guest-email" className="field" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} /></div>
        <div className="hidden" aria-hidden="true"><label htmlFor="guest-website">Website</label><input id="guest-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button variant="invitation" type="submit" disabled={!choice || !name.trim() || pending} className="h-12 w-full text-sm">{pending ? "Sending your reply…" : "Send my RSVP"}<ArrowRight aria-hidden="true" /></Button>
      </form>}
    </div>
    {confirmationOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-dialog-backdrop px-5 py-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmationOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="relative w-full max-w-md rounded-lg bg-card p-7 text-center shadow-2xl sm:p-10"><Button variant="iconSoft" size="icon" type="button" onClick={() => setConfirmationOpen(false)} aria-label="Close confirmation" title="Close confirmation" className="absolute right-4 top-4"><X /></Button><Heart className="mx-auto mb-4 size-6 text-rose" strokeWidth={1.5} /><p className="eyebrow text-rose">RSVP received</p><h2 id="confirmation-title" className="font-display mt-3 text-4xl leading-none">Thank you, {name.trim()}.</h2>{choice !== "no" ? <><p className="mt-4 text-sm text-muted-foreground">Your access code for the wedding is</p><div className="mt-5 rounded-md bg-secondary px-4 py-5"><strong className="font-display text-4xl tracking-widest text-foreground">{code}</strong></div><p className="mt-4 text-sm text-muted-foreground">Please copy this code or take a screenshot. You will need it at the door.</p><Button type="button" variant="invitation" onClick={copyCode} className="mt-6 h-11 w-full">{copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy code"}</Button></> : <p className="mt-4 text-sm text-muted-foreground">We've received your reply. You'll be missed.</p>}<Button type="button" variant="ghost" onClick={() => setConfirmationOpen(false)} className="mt-3 w-full">Close</Button></div></div>}
  </section>;
}

function WeddingPage() {
  useReveal();
  return <main className="overflow-hidden bg-background">
    <section className="invitation-hero flex min-h-[610px] flex-col justify-between text-hero-foreground sm:min-h-[660px] lg:min-h-[720px]">
      <img src={gardenHero} width={1536} height={1024} className="hero-photo" alt="A lush garden wedding ceremony with white flowers and an ivory canopy" fetchPriority="high" />
       <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 pt-7 sm:px-10 lg:px-16"><span className="font-display text-xl italic">C <span className="text-hero-foreground/70">&</span> O</span><span className="eyebrow !text-[10px]">28 · 11 · 2026</span></div>
      <div className="mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
        <div className="max-w-3xl"><p className="eyebrow mb-5 flex items-center gap-3 text-hero-foreground/90"><span className="h-px w-8 bg-hero-foreground/70" /> Together with our families</p><h1 className="font-display text-[clamp(4.5rem,10vw,9rem)] leading-[.78] font-medium">Chima <span className="italic font-normal">&</span><br />Opeyimika</h1><p className="mt-7 max-w-lg font-display text-2xl sm:text-3xl italic leading-tight text-hero-foreground/95">A love story worth celebrating together.</p></div>
        <div className="mt-9 flex flex-wrap items-center gap-5"><a href="#rsvp" className="inline-flex h-12 items-center gap-3 rounded-full bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary">Kindly RSVP <ArrowRight className="size-4" /></a><a href="#details" className="inline-flex items-center gap-2 text-sm text-hero-foreground/90 hover:text-hero-foreground">Explore the day <ArrowDown className="size-4" /></a></div>
      </div>
    </section>

    <div id="details" className="mx-auto grid max-w-7xl gap-5 px-5 pt-7 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:px-16 lg:pt-12">
      <div className="space-y-5" data-reveal>
         <div className="invitation-card rounded-lg p-6 sm:p-8"><div className="flex items-center justify-between"><p className="eyebrow text-rose">Save the date</p><span className="font-display text-2xl italic text-sage">01 / 04</span></div><div className="mt-5 flex items-end gap-4 border-b border-border pb-5"><span className="font-display text-7xl sm:text-8xl leading-none">28</span><div className="pb-2"><p className="font-display text-3xl leading-none">November</p><p className="mt-1 text-sm text-muted-foreground">Saturday, 2026 · 11:00 AM</p></div></div><div className="mt-5 flex items-start gap-3"><MapPin className="mt-1 size-5 shrink-0 text-rose" strokeWidth={1.5} /><div><p className="font-medium">{wedding.venue}</p><p className="text-sm text-muted-foreground">{wedding.area}</p><a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${wedding.venue}, ${wedding.area}`)}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-4">Get directions <ExternalLink className="size-3" /></a></div></div></div>
        <div className="invitation-card rounded-lg p-6 sm:p-8"><p className="eyebrow text-rose">The countdown</p><p className="font-display mb-6 mt-2 text-3xl italic">Until we say “I do”</p><Countdown /></div>
      </div>
      <RsvpForm />
    </div>

     <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-16 lg:py-32"><div data-reveal className="mb-10 max-w-xl"><p className="eyebrow text-rose">02 / Our story</p><h2 className="font-display mt-5 text-5xl sm:text-6xl leading-[.95]">It all started<br /><em>with a video.</em></h2><span className="mt-8 block h-px w-16 bg-rose" /></div><div className="grid gap-5 md:grid-cols-2">{[storyOne, storyTwo, storyThree, storyFour].map((photo, index) => <figure key={photo.asset_id} data-reveal className="story-frame relative isolate overflow-hidden rounded-md bg-muted"><img src={photo.url} alt={["Chima and Opeyimika smiling together in a black and white portrait", "Chima and Opeyimika embracing and smiling", "Chima looking at Opeyimika as they embrace", "Chima and Opeyimika sharing a quiet embrace"][index]} loading="lazy" className="absolute inset-0 h-full w-full object-cover object-center" /><div className="story-shade absolute inset-0" /><figcaption className="absolute inset-x-0 bottom-0 px-6 pb-7 pt-16 text-center text-hero-foreground sm:px-9 sm:pb-10"><p className="mx-auto max-w-lg text-sm leading-relaxed sm:text-base">{wedding.story[index + 1]}</p></figcaption></figure>)}</div><p data-reveal className="font-display mt-12 text-center text-3xl italic text-foreground sm:text-4xl">“{wedding.quote}”</p></section>

    <section className="bg-surface py-20 lg:py-28"><div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><div data-reveal className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-rose">03 / The celebration</p><h2 className="font-display mt-3 text-5xl sm:text-6xl">A day to remember.</h2></div><p className="max-w-xs text-sm text-muted-foreground">From our first vows to the last dance, we can't wait to share it with you.</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{wedding.programme.map((item, index) => <div key={item.title} data-reveal className="invitation-card rounded-lg p-6"><span className="font-display text-3xl italic text-rose">0{index + 1}</span><div className="mt-10 border-t border-border pt-4"><p className="eyebrow text-sage">{item.time}</p><h3 className="font-display mt-2 text-3xl leading-none">{item.title}</h3><p className="mt-3 min-h-5 text-sm text-muted-foreground">{item.note || " "}</p></div></div>)}</div></div></section>

     <section className="bg-background py-20 lg:py-28"><div data-reveal className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"><p className="eyebrow text-rose">04 / What to wear</p><h2 className="font-display mt-3 text-4xl sm:text-5xl">Come as your <em>lovely</em> self.</h2><p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">{wedding.dressCode}</p><div className="mt-7 flex flex-wrap gap-2"><span className="rounded-full bg-secondary px-4 py-2 text-xs font-medium text-secondary-foreground">Black tie for the gents</span><span className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-accent-foreground">Church dress for the ladies</span></div></div></section>

    <section className="bg-surface py-20"><div className="mx-auto max-w-3xl px-6 sm:px-10" data-reveal><p className="eyebrow text-rose">Good to know</p><h2 className="font-display mt-3 text-5xl">A few little details.</h2><div className="mt-9 divide-y divide-border border-t border-border">{wedding.faqs.map((faq) => <details key={faq.q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium marker:hidden">{faq.q}<span className="text-xl font-light text-rose transition-transform group-open:rotate-45">+</span></summary><p className="max-w-xl pt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p></details>)}</div></div></section>
     <footer className="px-6 py-14 text-center"><Heart className="mx-auto size-5 text-rose" strokeWidth={1.4} /><p className="font-display mt-4 text-4xl italic">Chima & Opeyimika</p><p className="eyebrow mt-3 text-muted-foreground">28 November 2026 · Lagos</p><p className="mt-3 text-sm text-muted-foreground">{wedding.hashtag}</p></footer>
  </main>;
}