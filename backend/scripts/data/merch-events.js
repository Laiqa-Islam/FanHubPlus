/**
 * Merchandise showcase and event listings.
 *
 * Merchandise can carry a local storefront image and price. Older editorial
 * showcase entries fall back to licensed stock art and a deterministic demo
 * price in the seeder.
 *
 * Events use real conventions with genuine host cities and coordinates so the
 * map and the city filter have something truthful to work with. Dates are
 * seeded relative to the current date, which keeps the calendar populated
 * whenever the project is demonstrated.
 */

export const MERCH_SEED = [
  {
    category: "anime",
    name: "Shattered Horizon — 1/7 Scale Figure",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -120,
    description:
      "Cold-cast resin, roughly 24cm to the top of the base. The sculpt is notable for handling fabric folds without the usual scale-figure stiffness, and the base doubles as a display for the alternate faceplate.",
  },
  {
    category: "anime",
    name: "Autumn Season Art Book",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -60,
    description:
      "Two hundred pages of background paintings, colour scripts and layout roughs with commentary from the art director. Printed on uncoated stock, which suits the pencil work better than the usual gloss.",
  },
  {
    category: "anime",
    name: "Key Animation Print Set",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -30,
    description:
      "Six reproduction genga sheets showing a single cut at each stage of production, packaged flat. Sold at convention only.",
  },
  {
    category: "gaming",
    name: "Nullpoint — Collector's Steelbook",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 45,
    description:
      "Steelbook case, cloth map, and a sixty-page field manual written in-universe. The manual is the interesting part — it contains routing information that functions as an actual hint book.",
  },
  {
    category: "gaming",
    name: "Record Keeper Enamel Pin Set",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -90,
    description:
      "Five hard-enamel pins with screen-printed detail, on a backing card designed as a save-file screen. Double-posted, so they sit flat on a jacket.",
  },
  {
    category: "gaming",
    name: "Cascade Circuit — Arcade Cabinet Replica",
    tag: "Limited Edition",
    isUpcoming: true,
    releaseOffset: 80,
    description:
      "Quarter-scale cabinet with a working LCD and a genuinely usable microswitch stick. Side art is screen-printed rather than a decal, which is unusual at this size.",
  },
  {
    category: "gaming",
    name: "Retro Handheld Restoration Kit",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -15,
    description:
      "Replacement shell, screen lens, membranes and a tri-wing driver. Covers the three most common failure points on ageing handhelds.",
  },
  {
    category: "movies",
    name: "The Quiet Season — Poster Print",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -45,
    description:
      "Screen-printed in four colours on heavy cotton stock, numbered to an edition of three hundred. The palette is pulled directly from the film's colour script.",
  },
  {
    category: "movies",
    name: "Deepwater — Creature Maquette",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -200,
    description:
      "A reproduction of the practical build's design maquette, cast from the production's own scan. Unpainted, because the original was.",
  },
  {
    category: "movies",
    name: "Practical Effects: The Book",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 30,
    description:
      "A workshop-level survey of animatronics, miniatures and in-camera compositing, illustrated with build photography rather than finished frames.",
  },
  {
    category: "tv-shows",
    name: "Longitude — Crew Patch Set",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -75,
    description:
      "Embroidered patches for each department shown on the series, including two that only appear as background detail in a single episode.",
  },
  {
    category: "tv-shows",
    name: "Title Sequence Vinyl",
    tag: "Limited Edition",
    isUpcoming: true,
    releaseOffset: 25,
    description:
      "The full title theme plus every seasonal variation, pressed on clear vinyl with an etched B-side. Sleeve notes cover the sequence's design process.",
  },
  {
    category: "tv-shows",
    name: "Meridian Line — Script Facsimile",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -10,
    description:
      "A facsimile shooting script for the bottle episode, including the revision pages in their production colours.",
  },
  {
    category: "k-pop",
    name: "HALO — Concept Photobook",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 20,
    description:
      "Three concept sets across 180 pages, with the art direction notes reproduced alongside the photography. Includes a randomised inclusion.",
  },
  {
    category: "k-pop",
    name: "Third-Generation Lightstick",
    tag: "Limited Edition",
    isUpcoming: true,
    releaseOffset: 55,
    description:
      "Bluetooth-addressable so venues can drive the whole audience as a display. The silhouette is the identifying element, since colour is controlled centrally.",
  },
  {
    category: "k-pop",
    name: "B-Side Sessions — Cassette",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -40,
    description:
      "Album cuts and demo versions on cassette, with a fold-out insert carrying full production credits — increasingly the part collectors actually want.",
  },
  {
    category: "comics",
    name: "Sixth City — Complete Omnibus",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -150,
    description:
      "The full run in one sewn-bound volume, with the original covers reproduced as a gallery and the letters pages retained.",
  },
  {
    category: "comics",
    name: "Grid — Nine-Panel Print Set",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -20,
    description:
      "Nine prints designed to hang as a grid, reproducing the run's most discussed page at poster scale.",
  },
  {
    category: "comics",
    name: "Inker's Brush Set",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -5,
    description:
      "Three sable brushes in the sizes most commonly used for comic inking, plus a nib holder and an assortment of nibs.",
  },
  {
    category: "manga",
    name: "Ashfall — Box Set, Volumes 1–8",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -100,
    description:
      "The first arc collected in a slipcase whose spines form a single illustration when shelved in order.",
  },
  {
    category: "manga",
    name: "Screentone Sample Pack",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -8,
    description:
      "Forty adhesive tone sheets across the dot densities and gradients used most often in serialised work, with a cutting blade.",
  },
  {
    category: "manga",
    name: "Tidewater — Chapter One Facsimile",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 65,
    description:
      "The opening chapter reproduced at original board size, including the blue-pencil underdrawing visible in the margins.",
  },
  {
    category: "cosplay",
    name: "Meridian Armour Pattern Pack",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -35,
    description:
      "Printable pattern sheets for the community-standard armour reference, scaled to three body sizes with bevel guides marked.",
  },
  {
    category: "cosplay",
    name: "Thermoplastic Starter Kit",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -3,
    description:
      "Two sheets of thermoplastic, a contact-safe heat gun, a respirator and a set of sculpting tools. Enough for one pauldron and the mistakes that precede it.",
  },
  {
    category: "cosplay",
    name: "Prop LED Diffusion Kit",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 40,
    description:
      "Addressable strip, diffusion sheet in three densities, a battery pack sized for a convention day, and an inline fuse — the component most builds omit.",
  },
  {
    category: "k-pop",
    name: "BLACKPINK Fan Essentials Set",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -1,
    priceCents: 4900,
    imageUrl: "/merch/blackpink-fan-kit.jpg",
    description:
      "A coordinated fan set with apparel, lightstick-style accessory, mini bag and tote in the group’s signature black-and-pink palette.",
  },
  {
    category: "k-pop",
    name: "BLACKPINK Hammer Lightstick",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -2,
    priceCents: 6900,
    imageUrl: "/merch/blackpink-lightstick.jpg",
    description:
      "The instantly recognisable twin-heart hammer silhouette, made for concert nights, shelf displays and fan photos.",
  },
  {
    category: "k-pop",
    name: "Stray Kids Utility Backpack",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -3,
    priceCents: 4600,
    imageUrl: "/merch/stray-kids-backpack.jpg",
    gallery: ["/merch/stray-kids-backpack-alt.jpg"],
    description:
      "A black everyday backpack with graphic front panel, roomy compartments and fan-detail hardware for school, travel or concert queues.",
  },
  {
    category: "k-pop",
    name: "BTS Chain Detail Backpack",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -4,
    priceCents: 4800,
    imageUrl: "/merch/bts-backpack.jpg",
    description:
      "Compact black BTS-inspired backpack with a blue-red logo panel, chain detail and multiple front storage sections.",
  },
  {
    category: "k-pop",
    name: "Hand-Painted BTS Stage Jacket",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -5,
    priceCents: 8900,
    imageUrl: "/merch/bts-painted-jacket.jpg",
    description:
      "A one-off black denim statement jacket finished with a hand-painted group portrait across the back panel.",
  },
  {
    category: "anime",
    name: "Demon Slayer Character Keychain Set",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -1,
    priceCents: 1600,
    imageUrl: "/merch/demon-slayer-keychains.jpg",
    description:
      "A seven-piece chibi character keychain set, sized for bags, convention lanyards and display boards.",
  },
  {
    category: "anime",
    name: "Jujutsu Kaisen Plush Pair",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -2,
    priceCents: 2600,
    imageUrl: "/merch/jujutsu-kaisen-plush-pair.jpg",
    description:
      "A soft seated duo with embroidered uniform details, designed to display together on a desk or shelf.",
  },
  {
    category: "anime",
    name: "Jujutsu Kaisen Mini Figure Pair",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -3,
    priceCents: 2900,
    imageUrl: "/merch/jujutsu-kaisen-figure-pair.jpg",
    description:
      "Two compact stylised figures with oversized expressions and stable display bases for small shelf spaces.",
  },
  {
    category: "anime",
    name: "Demon Slayer Cup Collection",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -4,
    priceCents: 3200,
    imageUrl: "/merch/demon-slayer-cups.jpg",
    description:
      "A mix-and-match collection of character-print cups with vivid artwork for desks, watch parties and gifting.",
  },
  {
    category: "anime",
    name: "Anime Character Keychain Roll",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -5,
    priceCents: 1400,
    imageUrl: "/merch/anime-keychain-set.jpg",
    description:
      "A bright assortment of illustrated character straps, ready for backpacks, keys and ita-bag layouts.",
  },
  {
    category: "anime",
    name: "Spider-Verse Mini Plush",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -6,
    priceCents: 2400,
    imageUrl: "/merch/spiderverse-plush.jpg",
    description:
      "A pocket-sized black-and-red masked plush with soft dimensional details and a display-friendly seated pose.",
  },
  {
    category: "anime",
    name: "Dual Orbit Anime Ring",
    tag: "Exclusive",
    isUpcoming: false,
    releaseOffset: -7,
    priceCents: 1800,
    imageUrl: "/merch/anime-ring.jpg",
    description:
      "A sculptural silver-tone ring with intersecting bands and a compact geometric centrepiece.",
  },
  {
    category: "comics",
    name: "Spider-Man Pendant Necklace",
    tag: "Collectible",
    isUpcoming: false,
    releaseOffset: -1,
    priceCents: 2200,
    imageUrl: "/merch/spider-man-necklace.jpg",
    description:
      "A polished spider-emblem pendant on a fine chain, subtle enough for everyday wear while still reading clearly to fans.",
  },
  {
    category: "comics",
    name: "Black Panther Kimoyo Replica Set",
    tag: "Limited Edition",
    isUpcoming: false,
    releaseOffset: -2,
    priceCents: 7800,
    imageUrl: "/merch/black-panther-replica.jpg",
    description:
      "A boxed collector display pairing Kimoyo-style beads with a detailed Black Panther necklace replica.",
  },
  {
    category: "comics",
    name: "Avengers Logo Street Tee",
    tag: "Restock",
    isUpcoming: false,
    releaseOffset: -3,
    priceCents: 2800,
    imageUrl: "/merch/avengers-tee.jpg",
    description:
      "A black graphic T-shirt with a circular Avengers emblem and colourful hero marks across the chest.",
  },
  {
    category: "comics",
    name: "Avengers Logo Hoodie",
    tag: "Pre-Order",
    isUpcoming: true,
    releaseOffset: 14,
    priceCents: 6400,
    imageUrl: "/merch/avengers-hoodie.jpg",
    description:
      "A light-grey pullover hoodie with a large front emblem, contrast hood lining and relaxed everyday fit.",
  },
];

export const EVENT_SEED = [
  {
    category: "anime",
    title: "Anime Expo",
    type: "convention",
    city: "Los Angeles",
    country: "United States",
    venue: "Los Angeles Convention Center",
    lat: 34.0403,
    lng: -118.2696,
    inDays: 96,
    description:
      "North America's largest anime convention. Industry panels, licensing announcements, a very large artist alley, and concert programming across four days.",
  },
  {
    category: "manga",
    title: "Comiket",
    type: "convention",
    city: "Tokyo",
    country: "Japan",
    venue: "Tokyo Big Sight",
    lat: 35.6298,
    lng: 139.7944,
    inDays: 128,
    description:
      "The world's largest self-published comic fair. Overwhelmingly doujinshi, organised by circle rather than by publisher, and run with a logistical precision that is itself worth seeing.",
  },
  {
    category: "comics",
    title: "San Diego Comic-Con",
    type: "convention",
    city: "San Diego",
    country: "United States",
    venue: "San Diego Convention Center",
    lat: 32.7065,
    lng: -117.1614,
    inDays: 110,
    description:
      "The convention that set the template for the modern pop-culture show. Comics programming remains strong despite the film and television presence that dominates the coverage.",
  },
  {
    category: "gaming",
    title: "Gamescom",
    type: "convention",
    city: "Cologne",
    country: "Germany",
    venue: "Koelnmesse",
    lat: 50.9473,
    lng: 6.9835,
    inDays: 140,
    description:
      "Europe's largest games event, split between a trade area and a consumer floor. The indie hall is consistently the most interesting part.",
  },
  {
    category: "cosplay",
    title: "MCM London Comic Con",
    type: "convention",
    city: "London",
    country: "United Kingdom",
    venue: "ExCeL London",
    lat: 51.5081,
    lng: 0.0294,
    inDays: 34,
    description:
      "Strong cosplay presence with a well-run masquerade and dedicated repair stations on the floor. Good first convention for anyone bringing a build.",
    story:
      "Three days, the whole of ExCeL, and more happening at once than any one person " +
      "can see. The main halls are the advertised version — panels, signings, the " +
      "queue for the big announcement. The actual convention is the artist alley and " +
      "the cosplay repair station, where people who spent four months on a build fix " +
      "it with a glue gun and carry on. Go with a plan and abandon it by lunchtime.",
  },
  {
    category: "anime",
    title: "Japan Expo",
    type: "convention",
    city: "Paris",
    country: "France",
    venue: "Paris Nord Villepinte",
    lat: 49.0097,
    lng: 2.5147,
    inDays: 88,
    description:
      "The largest Japanese-culture event in Europe, covering anime, manga, games and traditional arts across four halls.",
  },
  {
    category: "k-pop",
    title: "KCON",
    type: "concert",
    city: "Seoul",
    country: "South Korea",
    venue: "KINTEX",
    lat: 37.6688,
    lng: 126.7452,
    inDays: 62,
    description:
      "Convention programming by day and a multi-act concert by night. The panel track on production and choreography is underrated.",
  },
  {
    category: "comics",
    title: "Lucca Comics & Games",
    type: "convention",
    city: "Lucca",
    country: "Italy",
    venue: "Lucca Historic Centre",
    lat: 43.843,
    lng: 10.5079,
    inDays: 155,
    description:
      "Held across an entire walled medieval town rather than in a hall, which makes it the most atmospheric convention on the calendar.",
  },
  {
    category: "gaming",
    title: "EVO Championship Series",
    type: "convention",
    city: "Las Vegas",
    country: "United States",
    venue: "Mandalay Bay",
    lat: 36.0918,
    lng: -115.176,
    inDays: 118,
    description:
      "The fighting-game community's flagship tournament. Open bracket, which means anyone can enter and occasionally someone unknown goes very far.",
  },
  {
    category: "tv-shows",
    title: "Longitude — Finale Screening",
    type: "screening",
    city: "Bristol",
    country: "United Kingdom",
    venue: "Watershed",
    lat: 51.4507,
    lng: -2.5976,
    inDays: 12,
    description:
      "Big-screen finale showing followed by a Q&A with two of the series' directors. Limited capacity.",
    story:
      "Eight months of Sunday-night theorising, settled in one room. The Watershed " +
      "has been running these for the whole season and the last one is the reason the " +
      "rest existed — a hundred people who have already read every thread, watching " +
      "the thing they have been arguing about, live and at the same time. Expect " +
      "audible reactions. Expect at least one person to be very wrong in public.",
  },
  {
    category: "movies",
    title: "The Quiet Season — Premiere",
    type: "premiere",
    city: "London",
    country: "United Kingdom",
    venue: "BFI Southbank",
    lat: 51.5074,
    lng: -0.1157,
    inDays: 27,
    description:
      "Premiere screening with the cinematographer in attendance, presented from a 35mm print.",
    story:
      "The first public screening, with the people who made it in the room. A " +
      "premiere is mostly a queue and a photograph, but the forty minutes after the " +
      "credits are the reason to come: a director taking questions from an audience " +
      "that has had no time to form a consensus yet, which is the only point at which " +
      "the answers are still interesting.",
  },
  {
    category: "cosplay",
    title: "Armour Build Meetup",
    type: "meetup",
    city: "Birmingham",
    country: "United Kingdom",
    venue: "Custard Factory",
    lat: 52.4771,
    lng: -1.8811,
    inDays: 18,
    description:
      "Informal build day. Bring work in progress, share heat guns, and get a second opinion before you commit to a cut.",
    story:
      "Bring the thing you have been stuck on. This is a working day rather than a " +
      "showcase: long tables, heat guns, contact cement, and enough people who have " +
      "already made the mistake you are about to make. The useful part is not the " +
      "demonstration at the front — it is the person two seats down who looks at your " +
      "bevel and tells you to start that edge again.",
  },
  {
    category: "comics",
    title: "Emerald City Comic Con",
    type: "convention",
    city: "Seattle",
    country: "United States",
    venue: "Seattle Convention Center",
    lat: 47.6116,
    lng: -122.332,
    inDays: 73,
    description:
      "Creator-focused programming and one of the better artist alleys in North America.",
  },
  {
    category: "anime",
    title: "Anime NYC",
    type: "convention",
    city: "New York",
    country: "United States",
    venue: "Javits Center",
    lat: 40.7578,
    lng: -74.0022,
    inDays: 47,
    description:
      "Publisher-heavy programming with a reliable run of licensing announcements and a strong manga presence.",
  },
  {
    category: "manga",
    title: "Mangaka Workshop",
    type: "meetup",
    city: "Edinburgh",
    country: "United Kingdom",
    venue: "Summerhall",
    lat: 55.9412,
    lng: -3.1806,
    inDays: 40,
    description:
      "A working session on panel layout and screentone, capped at twenty places. Materials provided.",
    story:
      "Six hours, a small room, and one working professional who will look at your " +
      "pages and tell you the truth about them. The morning is panel construction and " +
      "pacing; the afternoon is everyone drawing the same two-page spread and seeing " +
      "how differently it comes out. Bring finished work rather than your best work — " +
      "the critique is more useful on something you have already stopped defending.",
  },
  {
    category: "k-pop",
    title: "Comeback Listening Party",
    type: "meetup",
    city: "Manchester",
    country: "United Kingdom",
    venue: "YES Basement",
    lat: 53.4779,
    lng: -2.2426,
    inDays: 9,
    description:
      "Album playback, concept discussion and a photocard trade table. Free entry, arrive early for the trade.",
    story:
      "A basement room, one good sound system, and a tracklist nobody in the room has " +
      "heard yet. The format is simple enough that it lives or dies on the crowd: the " +
      "album plays start to finish with no talking over it, and then everyone argues " +
      "about the B-sides until they are asked to leave. Come for the first play, stay " +
      "for the part where someone tries to defend the ballad.",
  },
];
