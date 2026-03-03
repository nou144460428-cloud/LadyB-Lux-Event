import Link from 'next/link';
import DecorationMaterialsCatalog from '@/components/DecorationMaterialsCatalog';
import DecorationServicePackages from '@/components/DecorationServicePackages';
import CateringServicePackages from '@/components/CateringServicePackages';
import GrillServiceSubcategories from '@/components/GrillServiceSubcategories';
import PasteriesSubcategories from '@/components/PasteriesSubcategories';

interface Vendor {
  id: number;
  name: string;
  description: string;
  rating: number;
  image: string;
  location: string;
  priceRange: string;
}

// Mock data - replace with actual API call later
const MOCK_VENDORS: Vendor[] = [
  {
    id: 1,
    name: "Lady B's Catering",
    description: "Exquisite local and continental dishes for your events.",
    rating: 4.8,
    image: "https://placehold.co/600x400?text=Catering",
    location: "Lagos, Nigeria",
    priceRange: "₦₦"
  },
  {
    id: 2,
    name: "Supreme Decor",
    description: "Transforming spaces into magical experiences.",
    rating: 4.5,
    image: "https://placehold.co/600x400?text=Decor",
    location: "Abuja, Nigeria",
    priceRange: "₦₦₦"
  },
  {
    id: 3,
    name: "DJ Max Vibes",
    description: "The best sounds for your party.",
    rating: 4.9,
    image: "https://placehold.co/600x400?text=DJ",
    location: "Lagos, Nigeria",
    priceRange: "₦"
  }
];

const EVENT_PLANNER_PHOTOS = [
  {
    title: 'Classic White Wedding',
    location: 'Lekki, Lagos',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Luxury Reception Hall',
    location: 'Victoria Island, Lagos',
    src: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Executive Gala Setup',
    location: 'Abuja',
    src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
];

const EVENT_PLANNER_VIDEOS = [
  {
    title: 'Reception Walkthrough',
    note: 'Venue styling and table arrangement',
    src: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
    poster:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Evening Highlights',
    note: 'Lighting and guest ambience',
    src: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
    poster:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  },
];

const DECORATION_MATERIALS = [
  {
    id: 101,
    name: 'Gold Chiavari Chairs',
    description: 'Premium seating set for weddings and luxury receptions.',
    unit: 'per chair',
    price: '₦5,500',
    location: 'Lagos',
    image: 'https://placehold.co/600x400?text=Chairs',
  },
  {
    id: 102,
    name: 'Crystal Centerpieces',
    description: 'Elegant centerpiece package for banquet and VIP tables.',
    unit: 'per table',
    price: '₦18,000',
    cautionFeeRate: 0.3,
    location: 'Abuja',
    image: 'https://placehold.co/600x400?text=Centerpiece',
  },
  {
    id: 103,
    name: 'Stage Backdrop Panels',
    description: 'Modular backdrop wall for stage styling and branding.',
    unit: 'per panel',
    price: '₦25,000',
    location: 'Port Harcourt',
    image: 'https://placehold.co/600x400?text=Backdrop',
  },
  {
    id: 104,
    name: 'Ambient Event Lighting',
    description: 'Warm and cool-tone lighting kits for event atmosphere.',
    unit: 'per rig',
    price: '₦30,000',
    cautionFeeRate: 0.4,
    location: 'Lagos',
    image: 'https://placehold.co/600x400?text=Lighting',
  },
  {
    id: 105,
    name: 'Luxury Table Linen Set',
    description: 'Premium table cloth and napkin package for fine dining setups.',
    unit: 'per table',
    price: '₦8,500',
    location: 'Ibadan',
    image: 'https://placehold.co/600x400?text=Linen',
  },
  {
    id: 106,
    name: 'Acrylic Dessert Stands',
    description: 'Modern transparent display stands for cakes and pastries.',
    unit: 'per stand',
    price: '₦6,000',
    location: 'Lagos',
    image: 'https://placehold.co/600x400?text=Dessert+Stand',
  },
];

const DECORATOR_DEFAULT_CAUTION_FEE_RATE = 0.2;

const FULL_DECORATION_PACKAGES = [
  {
    id: 'essential',
    name: 'Essential Elegance',
    description: 'Complete decoration setup for intimate events and private celebrations.',
    price: 450000,
    turnaround: 'Setup window: 24-48 hours',
    features: [
      'Theme consultation and mood board',
      'Table styling and centerpieces',
      'Entrance styling and photo corner',
      'On-site setup team',
    ],
  },
  {
    id: 'signature',
    name: 'Signature Luxury',
    description: 'Premium full-space transformation for weddings, launches, and receptions.',
    price: 980000,
    turnaround: 'Setup window: 48-72 hours',
    features: [
      'Creative direction and decor concept',
      'Custom stage and backdrop styling',
      'Lighting mood design',
      'Floral and premium linen integration',
      'On-site coordination and teardown',
    ],
  },
  {
    id: 'royal',
    name: 'Royal Grand Experience',
    description: 'High-end production decoration for large events and executive galas.',
    price: 1650000,
    turnaround: 'Setup window: 72+ hours',
    features: [
      'Bespoke concept with 3D floor plan',
      'Grand entrance and ceiling installation',
      'VIP lounge and stage styling',
      'Premium lighting and effects',
      'Dedicated production manager',
    ],
  },
];

const CATERING_PACKAGES = [
  {
    id: 'buffet-classic',
    name: 'Classic Buffet',
    description: 'Balanced local and continental menu for social and family events.',
    pricePerGuest: 8500,
    minGuests: 50,
    maxGuests: 250,
    features: [
      '2 protein options',
      '3 side dishes + salad',
      'Table service attendants',
      'Non-alcoholic drinks station',
    ],
  },
  {
    id: 'premium-corporate',
    name: 'Premium Corporate',
    description: 'Refined presentation and menu curation for executive audiences.',
    pricePerGuest: 14500,
    minGuests: 80,
    maxGuests: 400,
    features: [
      '3 premium protein options',
      'Live chef finishing station',
      'Branded table setup',
      'Service captains and floor support',
    ],
  },
  {
    id: 'luxury-signature',
    name: 'Luxury Signature Dining',
    description: 'Top-tier catering experience tailored for weddings and flagship events.',
    pricePerGuest: 22500,
    minGuests: 100,
    maxGuests: 600,
    features: [
      'Custom tasting menu',
      'Multiple cuisine stations',
      'Dessert and cocktail pairing',
      'Dedicated hospitality manager',
    ],
  },
];

const GRILL_SUBCATEGORIES = [
  {
    id: 'asun',
    name: 'Asun',
    description: 'Spicy smoked goat meat station, expertly grilled and served hot.',
    pricePerGuest: 3200,
    minGuests: 60,
    features: [
      'Live asun station setup',
      'Peppered sauce options',
      'Serving attendants',
    ],
    addOns: ['Jollof Pairing', 'Plantain Sides', 'Extra Pepper Mix'],
  },
  {
    id: 'barbecue',
    name: 'Barbecue',
    description: 'Mixed barbecue grills for social, wedding, and executive events.',
    pricePerGuest: 4500,
    minGuests: 70,
    features: [
      'Chicken, beef, and fish options',
      'Signature marinades',
      'Live carving service',
    ],
    addOns: ['Seafood Skewers', 'Premium Sauce Bar', 'Cocktail Pairing'],
  },
  {
    id: 'shawarma',
    name: 'Shawarma',
    description: 'Freshly rolled shawarma service for premium cocktail and evening events.',
    pricePerGuest: 2800,
    minGuests: 50,
    features: [
      'Chicken and beef shawarma options',
      'Custom toppings and sauces',
      'Fast-serve live counter',
    ],
    addOns: ['Falafel Option', 'Fries Station', 'Drink Counter'],
  },
];

const PASTERIES_SUBCATEGORIES = [
  {
    id: 'cakes',
    name: 'Cakes',
    description: 'Custom celebration cakes for weddings, birthdays, and premium events.',
    pricePerGuest: 3500,
    minGuests: 40,
    features: [
      'Theme-matched cake design',
      'Tiered and fondant options',
      'Dessert styling support',
    ],
    addOns: ['Cupcake Tower', 'Cake Table Styling', 'Custom Monogram Topper'],
  },
  {
    id: 'small-chops',
    name: 'Small Chops',
    description: 'Cocktail chops service for receptions, private parties, and launch events.',
    pricePerGuest: 2200,
    minGuests: 60,
    features: [
      'Assorted chops platter',
      'Serving attendants',
      'Fresh prep and warm service',
    ],
    addOns: ['Live Fry Station', 'Mocktail Counter', 'Premium Dipping Sauces'],
  },
];

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category?: string }>;
}) {
  const { category } = await params;
  const safeCategory = category ?? 'vendors';
  const isEventPlannerCategory = safeCategory === 'event-planners';
  const isDecorationMaterialsCategory = safeCategory === 'decorations-rentals';
  const isOrderDecorationCategory = safeCategory === 'order-decoration';
  const isCateringCategory = safeCategory === 'catering';
  const isGrillsCategory =
    safeCategory === 'grills' || safeCategory === 'asun-barbecue-service';
  const isPasteriesCategory =
    safeCategory === 'pasteries' ||
    safeCategory === 'cakes' ||
    safeCategory === 'small-chops';

  // Format slug back to title with specific naming override.
  const categoryTitle = isEventPlannerCategory
    ? 'Event Planner'
    : isDecorationMaterialsCategory
      ? 'Event Decoration Material Rentals'
    : isOrderDecorationCategory
      ? 'Order Decoration'
    : isCateringCategory
      ? 'Catering'
    : isGrillsCategory
      ? 'Grills'
    : isPasteriesCategory
      ? 'Pasteries'
    : safeCategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-bold mb-2">{categoryTitle}</h1>
        <p className="text-gray-600">
          {isEventPlannerCategory
            ? 'Luxury event planning is handled through a guided flow.'
            : isDecorationMaterialsCategory
              ? 'This category is for decorators to rent event decoration materials.'
            : isOrderDecorationCategory
              ? 'Book complete decoration services for your event.'
            : isCateringCategory
              ? 'Select premium catering packages for your event.'
            : isGrillsCategory
              ? 'Choose a grill subcategory: Asun, Barbecue, or Shawarma.'
            : isPasteriesCategory
              ? 'Choose a pasteries subcategory: Cakes or Small Chops.'
            : `Browse the best vendors for ${categoryTitle.toLowerCase()}.`}
        </p>
      </div>

      {isEventPlannerCategory ? (
        <div className="space-y-8">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Guided Request
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Order Luxury Event Planning
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              Customers cannot directly browse event planners from this page.
              Create your event first and we will match you with the right planning team.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/event/create"
                className="rounded-full border border-[#d3b37b] bg-[#d3b37b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#1a140d] transition hover:bg-[#e1c795]"
              >
                Create Event Request
              </Link>
              <Link
                href="/dashboard/customer"
                className="rounded-full border border-[#8f7650] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#f6ede1] transition hover:border-[#c9aa72] hover:text-[#c9aa72]"
              >
                Go To Dashboard
              </Link>
            </div>
          </div>

          <section className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(35,27,17,0.92),_rgba(17,13,8,0.96))] p-6 text-[#efe7dc]">
            <h3 className="text-2xl text-[#f8f1e8]">Recent Event Pictures</h3>
            <p className="mt-2 text-sm text-[#d3c3ac]">
              Sample visuals from recent luxury event planning outcomes.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {EVENT_PLANNER_PHOTOS.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-xl border border-[#4b3b24] bg-[#1a140c]"
                >
                  <img src={item.src} alt={item.title} className="h-44 w-full object-cover" />
                  <div className="p-3">
                    <p className="text-sm text-[#f8f1e8]">{item.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#a88d62]">
                      {item.location}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(35,27,17,0.92),_rgba(17,13,8,0.96))] p-6 text-[#efe7dc]">
            <h3 className="text-2xl text-[#f8f1e8]">Recent Event Videos</h3>
            <p className="mt-2 text-sm text-[#d3c3ac]">
              Short sample clips to preview production quality and event atmosphere.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {EVENT_PLANNER_VIDEOS.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-xl border border-[#4b3b24] bg-[#1a140c]"
                >
                  <video
                    controls
                    preload="metadata"
                    poster={item.poster}
                    className="h-56 w-full bg-black object-cover"
                  >
                    <source src={item.src} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                  <div className="p-3">
                    <p className="text-sm text-[#f8f1e8]">{item.title}</p>
                    <p className="mt-1 text-xs text-[#a88d62]">{item.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : isDecorationMaterialsCategory ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Material Catalog
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Decoration Materials To Order
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              This section is dedicated to event decorators and planners ordering rental materials.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/rentals/cart"
                className="rounded-full border border-[#d3b37b] bg-[#d3b37b] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#1a140d] transition hover:bg-[#e1c795]"
              >
                Open Rentals Cart
              </Link>
              <Link
                href="/rentals/checkout"
                className="rounded-full border border-[#7f6741] px-6 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#efe7dc] transition hover:border-[#d3b37b] hover:text-[#d3b37b]"
              >
                Go to Rentals Checkout
              </Link>
            </div>
          </div>

          <DecorationMaterialsCatalog
            items={DECORATION_MATERIALS}
            defaultCautionFeeRate={DECORATOR_DEFAULT_CAUTION_FEE_RATE}
          />
        </div>
      ) : isOrderDecorationCategory ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Full Service Booking
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Book Full Decoration
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              Select a package to book complete decoration delivery from concept
              design to final setup and teardown.
            </p>
          </div>

          <DecorationServicePackages packages={FULL_DECORATION_PACKAGES} />
        </div>
      ) : isCateringCategory ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Catering Booking
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Book Catering Services
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              Choose a package based on guest volume and service complexity.
              You can finalize details after adding the package to checkout.
            </p>
          </div>

          <CateringServicePackages packages={CATERING_PACKAGES} />
        </div>
      ) : isGrillsCategory ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Grills Service
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Grills Subcategories
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              Select and book your preferred grill subcategory service package.
            </p>
          </div>

          <GrillServiceSubcategories items={GRILL_SUBCATEGORIES} />
        </div>
      ) : isPasteriesCategory ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#4a3a22] bg-[linear-gradient(145deg,_rgba(54,42,27,0.85),_rgba(23,18,11,0.94))] p-8 text-[#efe7dc]">
            <p className="text-xs uppercase tracking-[0.18em] text-[#c9aa72]">
              Pasteries Service
            </p>
            <h2 className="mt-3 text-2xl text-[#f8f1e8] md:text-3xl">
              Pasteries Subcategories
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-[#d3c3ac]">
              Select your preferred pasteries option and proceed to checkout.
            </p>
          </div>

          <PasteriesSubcategories items={PASTERIES_SUBCATEGORIES} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_VENDORS.map((vendor) => (
            <div key={vendor.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="h-48 bg-gray-200 relative">
                {/* In a real app, use next/image here */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100">
                  {vendor.name} Image
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{vendor.name}</h2>
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center">
                    ★ {vendor.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{vendor.location} • {vendor.priceRange}</p>
                <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
