import Link from 'next/link';

const categories = [
  {
    title: 'Event Planner',
    description: 'Order luxury event planning for weddings, launches, and soirees.',
    slug: 'event-planners',
    icon: '◇',
  },
  {
    title: 'Event Decoration Material Rentals',
    description: 'Where decorators rent premium event materials and styling assets.',
    slug: 'decorations-rentals',
    icon: '✦',
  },
  {
    title: 'Order Decoration',
    description: 'Book full decoration execution for your event setup.',
    slug: 'order-decoration',
    icon: '✧',
  },
  {
    title: 'Catering',
    description: 'Order premium catering services for events of any size.',
    slug: 'catering',
    icon: '◈',
  },
  {
    title: 'Pasteries',
    description: 'Choose pastry subcategories: Cakes and Small Chops.',
    slug: 'pasteries',
    icon: '◆',
  },
  {
    title: 'Grills',
    description: 'Choose grill subcategories: Asun, Barbecue, and Shawarma services.',
    slug: 'grills',
    icon: '⬢',
  },
];

const sampleHighlights = [
  {
    title: 'Garden Wedding Reception',
    type: 'Photo',
    preview:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Luxury Indoor Decor',
    type: 'Photo',
    preview:
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Corporate Gala Setup',
    type: 'Video',
    preview:
      'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Cocktail Night Highlights',
    type: 'Video',
    preview:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function Home() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#2a2114_0%,_#16110a_45%,_#0d0a06_100%)] text-[#efe7dc]"
      style={{
        fontFamily:
          '"Trebuchet MS", "Gill Sans", "Segoe UI", sans-serif',
      }}
    >
      <div className="anim-float-glow pointer-events-none absolute -right-10 top-24 h-72 w-72 rounded-full bg-[#c8a86d]/20 blur-3xl" />
      <div className="anim-float-glow-slow pointer-events-none absolute -left-16 top-[30rem] h-80 w-80 rounded-full bg-[#6d5532]/30 blur-3xl" />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-14 pt-14 md:grid-cols-2 md:items-center md:pb-18 md:pt-20">
        <div className="anim-fade-rise">
          <p className="mb-4 text-xs uppercase tracking-[0.34em] text-[#cfb27a]">
            LadyB Lux Events
          </p>
          <h1
            className="max-w-4xl text-5xl leading-tight text-[#f8f1e8] md:text-7xl"
            style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
          >
            The Luxury Standard For Event Planning
          </h1>
          <p className="mt-6 max-w-2xl text-base text-[#d6c8b2] md:text-lg">
            Design, discover, and book elite vendors in one elevated experience.
            From signature weddings to executive celebrations, every detail is
            curated for impact.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/auth/register"
              className="rounded-full border border-[#d3b37b] bg-[#d3b37b] px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#1a140d] transition hover:bg-[#e1c795]"
            >
              Start Planning
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-[#8f7650] px-7 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#f6ede1] transition hover:border-[#c9aa72] hover:text-[#c9aa72]"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="anim-fade-rise-delay-1 relative h-[26rem] rounded-[2rem] border border-[#4f3e27] bg-[linear-gradient(160deg,_rgba(66,50,31,0.95),_rgba(21,16,10,0.95))] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute left-4 top-4 rounded-full border border-[#8c7250] bg-[#2b2116] px-4 py-1 text-[10px] uppercase tracking-[0.22em] text-[#d9bf8b]">
            Premium Experience
          </div>

          <div className="mt-14 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#5e4a2f] bg-[#1e170f]/90 p-4">
              <p className="text-2xl text-[#d6b57c]">✦</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#a58a61]">
                Verified Vendors
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#f4ebdf]">250+</p>
            </div>
            <div className="rounded-2xl border border-[#5e4a2f] bg-[#1e170f]/90 p-4">
              <p className="text-2xl text-[#d6b57c]">◌</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[#a58a61]">
                Events Delivered
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#f4ebdf]">4.8k</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-[#5e4a2f] bg-[linear-gradient(100deg,_rgba(215,180,118,0.18),_rgba(37,28,17,0.88))] p-5">
            <p
              className="text-2xl text-[#f6ece0]"
              style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
            >
              “Where impeccable planning meets unforgettable atmosphere.”
            </p>
          </div>

          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full border border-[#7a6342] bg-[#261d13] p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#a58a61]">
              Trusted
            </p>
            <p className="mt-2 text-2xl text-[#e2c58f]">★★★★★</p>
          </div>
        </div>
      </section>

      <section className="anim-fade-rise-delay-1 mx-auto max-w-7xl px-6 pb-16 md:pb-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2
            className="text-3xl text-[#f8f1e8] md:text-5xl"
            style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
          >
            Curated Categories
          </h2>
          <p className="text-sm uppercase tracking-[0.2em] text-[#c7a973]">
            Premium Network
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/vendors/${category.slug}`}
              className="anim-slow-pulse group rounded-2xl border border-[#4b3b24] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-7 transition hover:-translate-y-1 hover:border-[#caa66a] hover:shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.26em] text-[#c9aa72]">
                  Explore
                </p>
                <span className="text-2xl text-[#d5b57c]">{category.icon}</span>
              </div>
              <h3
                className="text-3xl text-[#f8f1e8] md:text-4xl"
                style={{
                  fontFamily: 'Didot, Garamond, "Times New Roman", serif',
                }}
              >
                {category.title}
              </h3>
              <p className="mt-3 text-sm text-[#d3c3ac]">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="anim-fade-rise-delay-2 mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 rounded-2xl border border-[#4f3d23] bg-[linear-gradient(145deg,_rgba(42,31,18,0.92),_rgba(17,13,8,0.96))] p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#c7a973]">
                Real Event Samples
              </p>
              <h2
                className="mt-2 text-3xl text-[#f8f1e8] md:text-4xl"
                style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
              >
                Browse Recent Pictures & Videos
              </h2>
            </div>
            <Link
              href="/samples"
              className="rounded-full border border-[#d3b37b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#f6ede1] transition hover:border-[#e1c795] hover:text-[#e1c795]"
            >
              View Full Gallery
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sampleHighlights.map((item) => (
              <Link
                key={item.title}
                href="/samples"
                className="group overflow-hidden rounded-xl border border-[#4b3b24] bg-[#1a140c]"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.preview}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-[#d6b57c] bg-[rgba(21,16,10,0.75)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#e7d0a2]">
                    {item.type}
                  </span>
                </div>
                <p className="p-3 text-sm text-[#e7dccd]">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="anim-slow-pulse rounded-2xl border border-[#4f3d23] bg-[linear-gradient(90deg,_rgba(201,170,114,0.14),_rgba(35,27,17,0.82))] p-8 md:p-10">
          <h2
            className="text-3xl text-[#f8f1e8] md:text-4xl"
            style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
          >
            Booking, Elevated
          </h2>
          <div className="mt-6 grid gap-5 text-sm text-[#d6c8b2] md:grid-cols-4">
            <div>
              <p className="text-[#cfb27a]">01</p>
              <p className="mt-2 font-semibold text-[#f3e7d6]">Create Profile</p>
              <p className="mt-1">Set your event vision and requirements.</p>
            </div>
            <div>
              <p className="text-[#cfb27a]">02</p>
              <p className="mt-2 font-semibold text-[#f3e7d6]">Select Vendors</p>
              <p className="mt-1">Compare premium offers by category.</p>
            </div>
            <div>
              <p className="text-[#cfb27a]">03</p>
              <p className="mt-2 font-semibold text-[#f3e7d6]">Confirm Booking</p>
              <p className="mt-1">Secure your picks with seamless checkout.</p>
            </div>
            <div>
              <p className="text-[#cfb27a]">04</p>
              <p className="mt-2 font-semibold text-[#f3e7d6]">Host Beautifully</p>
              <p className="mt-1">Deliver an event worthy of your guest list.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
