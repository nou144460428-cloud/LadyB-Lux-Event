import Link from 'next/link';

type EventMedia = {
  id?: string;
  title: string;
  type?: 'PHOTO' | 'VIDEO';
  location?: string;
  src: string;
  note?: string;
  poster?: string;
};

const fallbackPhotoSamples: EventMedia[] = [
  {
    title: 'Classic White Wedding',
    location: 'Lekki, Lagos',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Luxury Reception Hall',
    location: 'Victoria Island, Lagos',
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Golden Theme Engagement',
    location: 'Abuja',
    src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Executive Gala Dinner',
    location: 'Ikoyi, Lagos',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Private Garden Event',
    location: 'Port Harcourt',
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Modern Birthday Setup',
    location: 'Surulere, Lagos',
    src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1400&q=80',
  },
];

const fallbackVideoSamples: EventMedia[] = [
  {
    title: 'Reception Walkthrough',
    note: 'Venue styling + table arrangement',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    poster:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Evening Event Highlights',
    note: 'Lighting, ambience, guest flow',
    src: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
    poster:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80',
  },
];

async function getMediaSamples(): Promise<EventMedia[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiBase}/event-media`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return [];
    }
    return (await res.json()) as EventMedia[];
  } catch {
    return [];
  }
}

export default async function SamplesPage() {
  const remoteSamples = await getMediaSamples();
  const photoSamples = remoteSamples
    .filter((item) => item.type === 'PHOTO')
    .slice(0, 12);
  const videoSamples = remoteSamples
    .filter((item) => item.type === 'VIDEO')
    .slice(0, 8);

  const photosToRender =
    photoSamples.length > 0 ? photoSamples : fallbackPhotoSamples;
  const videosToRender =
    videoSamples.length > 0 ? videoSamples : fallbackVideoSamples;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 text-[#efe7dc]">
      <section className="rounded-2xl border border-[#4a3a22] bg-[radial-gradient(circle_at_top_right,_rgba(214,181,124,0.16),_rgba(18,14,9,0.92)_52%)] p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-[#b99b67]">Inspiration Gallery</p>
        <h1
          className="mt-2 text-4xl uppercase tracking-[0.08em] text-[#f4eadf] md:text-5xl"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          Recent Event Pictures & Videos
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-[#cdbca3]">
          Customers can browse recent event samples here to choose the mood, styling, and
          production quality they want before booking vendors.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/event/create"
            className="rounded-full border border-[#d3b37b] bg-[#d3b37b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#1a140d] transition hover:bg-[#e1c795]"
          >
            Create Event Request
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#8f7650] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#f6ede1] transition hover:border-[#c9aa72] hover:text-[#c9aa72]"
          >
            Back Home
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2
          className="mb-5 text-3xl text-[#f8f1e8]"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          Photo Samples
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photosToRender.map((sample) => (
            <article
              key={`${sample.title}-${sample.src}`}
              className="overflow-hidden rounded-xl border border-[#4b3b24] bg-[#1a140c]"
            >
              <img src={sample.src} alt={sample.title} className="h-52 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-lg text-[#f4eadf]">{sample.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#a88d62]">
                  {sample.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 pb-10">
        <h2
          className="mb-5 text-3xl text-[#f8f1e8]"
          style={{ fontFamily: 'Didot, Garamond, "Times New Roman", serif' }}
        >
          Video Samples
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          {videosToRender.map((sample) => (
            <article
              key={`${sample.title}-${sample.src}`}
              className="overflow-hidden rounded-xl border border-[#4b3b24] bg-[#1a140c]"
            >
              <video
                controls
                preload="metadata"
                poster={sample.poster}
                className="h-64 w-full bg-black object-cover"
              >
                <source src={sample.src} type="video/mp4" />
                Your browser does not support video playback.
              </video>
              <div className="p-4">
                <h3 className="text-lg text-[#f4eadf]">{sample.title}</h3>
                <p className="mt-1 text-sm text-[#cdbca3]">{sample.note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
