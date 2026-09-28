/**
 * Editorial content library.
 *
 * Written as real fandom journalism — commentary, craft explainers and guides
 * — rather than placeholder text, because the Explorer's search, filter and
 * sort surface only reads as convincing when the underlying writing does.
 *
 * Every piece names its own art in `art`, a file id in `public/content/`, so
 * the picture on a card is the thing the piece is about. That pinning matters
 * more than it sounds: the library previously cycled a channel pool by
 * position, which meant a piece about editing could open under a poster for a
 * film it never mentioned. Leave `art` empty and the old cycling still applies.
 *
 * The seven playable video pieces do the same thing with `media`: each was
 * written after watching the file it points at, and its art is a frame taken
 * from that file. The essays that used to carry the `video` type had no
 * footage behind them — they were articles wearing a play button — so they
 * are typed honestly now, and the videos are the pieces below that genuinely
 * have something to play.
 */

const raw = [
  // ─────────────────────────────── ANIME ───────────────────────────────
  {
    category: "anime",
    title: "Jujutsu Kaisen and the Problem of the Unbeatable Teacher",
    type: "article",
    genre: ["Criticism", "Writing"],
    year: 2026,
    popularity: 96,
    summary:
      "A series with the strongest character alive has to explain, every single arc, why he is not in the room. Jujutsu Kaisen turned that chore into its best running theme.",
    art: "anime-jujutsu-kaisen.jpg",
    paragraphs: [
      "Every shonen with a mentor eventually faces the same structural bill: if the teacher can solve the problem, the students have no story. Most series pay it cheaply — the mentor is away, injured, or conveniently forbidden to intervene. Jujutsu Kaisen pays it expensively, and gets a theme out of the transaction.",
      "The answer it lands on is institutional rather than physical. Gojo is not absent because he is weak or hurt; he is absent because the people who run jujutsu society need him to be. That reframes every scene where the students are outmatched: they are not waiting for rescue, they are absorbing the cost of a system that would rather lose them than lose control.",
      "It is why the sealing arc lands as hard as it does. The series had spent seventy chapters teaching readers that his absence was political, then made it literal. The shape of the story did not change at all — which is precisely the point it had been making.",
    ],
  },
  {
    category: "anime",
    title: "Demon Slayer's Water Effects Are Doing Something Unusual",
    type: "article",
    genre: ["Craft", "Animation"],
    year: 2025,
    popularity: 93,
    summary:
      "The breathing forms are famous for looking expensive. What is actually happening is a compositing trick borrowed from print, and once you see it you cannot unsee it.",
    art: "anime-demon-slayer.jpg",
    paragraphs: [
      "The water in Demon Slayer is not animated the way effects animation usually is. Rather than drawn frame-by-frame as moving shapes, much of it is a painted texture — closer to ukiyo-e woodblock water than to a cel-animated splash — pushed through the camera with digital distortion and layered glow.",
      "That choice has a cost and a payoff. The cost is that the water does not obey physics; it does not really behave as a volume moving through space. The payoff is that every frame reads as an illustration, so the fights survive being paused. Screenshots of this show circulate because the show was built to produce them.",
      "It also solves a scheduling problem. A painted, distorted texture can be composited by a different department on a different timeline from the character animation, which is how a weekly production sustains a look this dense. The style is not only an aesthetic decision — it is a pipeline decision that happens to look glorious.",
    ],
  },
  {
    category: "anime",
    title: "Attack on Titan: Storyboarding the Rumbling",
    type: "article",
    genre: ["Craft", "Breakdown"],
    year: 2025,
    popularity: 97,
    summary:
      "Scale is the hardest thing to animate convincingly. A shot-by-shot look at how the final season sold a horizon-wide advance without ever showing you the whole thing.",
    art: "anime-attack-on-titan.jpg",
    paragraphs: [
      "The temptation with an apocalyptic image is to show it whole — pull the camera back far enough to fit the catastrophe in frame. The final season almost never does. The Rumbling is shown in fragments: a foot, a shadow crossing a field, a wall of steam on a horizon line.",
      "Withholding the full shot is what makes the scale work. A wide shot gives the viewer a boundary, and a boundary is comforting; you can see where the disaster ends. Cutting between fragments removes the edge of the thing, so the imagination supplies a size no storyboard could draw.",
      "The sound mix does the rest. The low-frequency bed under those sequences is continuous across cuts, which glues fragments into one event. When the series finally does go wide, it has earned a shot that would have been ordinary two episodes earlier.",
    ],
  },
  {
    category: "anime",
    title: "Chainsaw Man Is a Comedy That Happens to Contain Horror",
    type: "article",
    genre: ["Criticism", "Tone"],
    year: 2026,
    popularity: 90,
    summary:
      "Read it as horror with jokes and the tonal swings feel arbitrary. Read it the other way round and the structure snaps into focus.",
    art: "anime-chainsaw-man.png",
    paragraphs: [
      "The usual complaint about Chainsaw Man is that it cannot hold a tone — that it lurches from slapstick to body horror without transition. That reading assumes horror is the baseline and comedy is the interruption. Flip it and the lurching stops being a flaw.",
      "Denji's entire interior life is a joke about scale: a protagonist in an apocalyptic war whose stated ambition never rises above bread, a roof and being touched. The horror is not the subject of the story, it is the setting the joke is told in. Every grotesque set piece is a punchline about how little any of it changes what he wants.",
      "That is also why the deaths land. In a straight horror series, death is the expected register and arrives on schedule. Here it interrupts a comedy, which is exactly how it feels when it interrupts a life.",
    ],
  },
  {
    category: "anime",
    title: "Frieren Understands That Grief Is a Pacing Problem",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2026,
    popularity: 92,
    summary:
      "Most fantasy uses time-skips to move a plot along. This one uses them as the whole emotional mechanism, and the slowness is the argument.",
    art: "anime-frieren.jpg",
    paragraphs: [
      "The premise is a structural joke with a knife in it: an elf for whom a decade is an afternoon, travelling with humans for whom it is a third of everything. The series does not explain that gap so much as make the viewer sit inside it, and the famously unhurried pacing is the only honest way to do that.",
      "What is unusual is where it puts its climaxes. The fights are competent but rarely the point; the peaks are almost always a small recognition arriving decades late. That inverts the genre's usual reward schedule, and it only works because the show refuses to speed up in between.",
      "The result is a fantasy series where the antagonist is duration. You cannot defeat it, you can only notice it earlier, and the show is quietly insistent that noticing earlier is the entire available victory.",
    ],
  },
  {
    category: "anime",
    title: "Vinland Saga: A Season Without a Fight",
    type: "image",
    genre: ["Craft", "Colour"],
    year: 2025,
    popularity: 85,
    summary:
      "The farmland arc stripped out the violence its audience arrived for. The colour script is how the series kept the tension without it.",
    art: "anime-vinland-saga.jpg",
    paragraphs: [
      "Removing combat from a Viking story is a commercial risk and an artistic one. The farmland arc does it deliberately, and the production compensates where viewers rarely look consciously: in the palette.",
      "The early series runs cold — steel, sea grey, blood as the only saturated note. The farm sequences shift to warm earth and low sun, which reads as relief for roughly two episodes and then starts to feel like confinement. Same warmth, opposite meaning, achieved without a single line of dialogue about it.",
      "When violence does return, the show does not brighten the reds; it drains everything else. The contrast does the work the choreography used to. It is the clearest demonstration in recent television that a colour script is a storytelling instrument rather than a decorating one.",
    ],
  },
  {
    category: "anime",
    title: "Writing the Strongest: What Gojo Costs a Story",
    type: "article",
    genre: ["Criticism", "Character"],
    year: 2026,
    popularity: 95,
    summary:
      "A character who cannot lose is a narrative liability. Some series hide him. The interesting ones make the hiding the subject.",
    art: "gojo-void.jpg",
    paragraphs: [
      "There is a specific failure mode for the overpowered character: the audience stops asking whether he will win and starts asking why the plot keeps contriving to exclude him. Once a reader is counting contrivances, the spell is gone.",
      "The escape is to make the exclusion diegetic. If the world has reasons — legal, political, institutional — to keep him out of the room, then every absence is characterisation rather than convenience. The blindfold works the same way: a costume element that says *holding back* before any dialogue has to.",
      "What separates a good version from a lazy one is whether the character is allowed to be wrong about anything. Power can be absolute as long as judgement is not, and the moment a story gives its strongest figure a blind spot, it gets its tension back for free.",
    ],
  },

  {
    category: "anime",
    title: "Watch: Demon Slayer With Everything but the Fighting Removed",
    type: "video",
    genre: ["Action", "Craft"],
    year: 2026,
    popularity: 94,
    summary:
      "Strip a season down to its combat and you find out what a show is actually built from. What survives this cut is a camera that never once loses the blade.",
    art: "video-demon-slayer-fights.jpg",
    media: "demon-slayer-fight-edit",
    timeline: [
      {
        label: "2016",
        title: "Serialisation begins",
        body: "A Weekly Shonen Jump run that is well-liked but not, at first, a phenomenon.",
      },
      {
        label: "2019",
        title: "The anime, and episode 19",
        body: "ufotable's adaptation. One episode's compositing — painted water pushed through digital distortion — turns the series into an event overnight.",
      },
      {
        label: "2020",
        title: "Mugen Train",
        body: "The highest-grossing film in Japanese history, in a year when cinemas were barely open.",
      },
      {
        label: "2021–2024",
        title: "The look becomes the standard",
        body: "Painted-texture effects layered over cel animation spread across the industry's top tier, because the pipeline reason for it is as strong as the aesthetic one.",
      },
      {
        label: "2024–",
        title: "Cut and re-cut",
        body: "Fan edits strip the series to its fights and it survives the cut, which is the clearest proof that the frames were built to be paused.",
      },
    ],
    paragraphs: [
      "A fan edit is an unkind test. Cut away the dialogue, the training, the flashbacks and the jokes, and most action series collapse into noise — exchanges that only made sense because someone explained the stakes forty seconds earlier. This one does not collapse, and the reason is legibility.",
      "Watch where the sword is in any given frame. Tanjiro leaps through a field of embers and the blade stays the brightest, most saturated object on screen; Giyu draws and the composition reorganises around the line of the draw. The effects work is dense enough to be genuinely hard to read, so the show compensates by treating the weapon as the frame's anchor and letting everything else blur past it.",
      "That is also why the fights survive being paused, screenshotted and re-cut by strangers. A sequence built so that each individual frame states who is attacking and from where is a sequence that can be shuffled, slowed, or set to unrelated music and still parse. The edit is not flattering the show. It is auditing it.",
    ],
  },
  {
    category: "anime",
    title: "Watch: Jujutsu Kaisen, Cut to “Big Dawgs”",
    type: "video",
    genre: ["Fan Work", "Editing"],
    year: 2026,
    popularity: 91,
    summary:
      "An edit set to a Hanumankind track, cutting on the snare rather than on the story. It makes the series feel faster than it actually is, and that is a technique, not an accident.",
    art: "video-jujutsu-kaisen-amv.jpg",
    media: "jujutsu-kaisen-big-dawgs",
    timeline: [
      {
        label: "2018",
        title: "Serialisation begins",
        body: "A cursed-energy battle manga with unusually precise character silhouettes — a detail that matters more later than it looks.",
      },
      {
        label: "2020",
        title: "The anime arrives",
        body: "MAPPA's adaptation lands mid-pandemic into an audience with time and a clipping habit.",
      },
      {
        label: "2021",
        title: "Shibuya",
        body: "The arc that generates the clips. Hollow Purple against a night street becomes one of the most re-uploaded shots in modern anime.",
      },
      {
        label: "2024",
        title: "Big Dawgs",
        body: "Hanumankind's track breaks internationally and becomes an editing bed — a tempo that suits beat-locked cutting.",
      },
      {
        label: "2024–",
        title: "The edit as its own form",
        body: "Thousands of versions. The series' single-frame legibility is what lets a cut this fast stay readable at all.",
      },
    ],
    paragraphs: [
      "The anime music video is one of the few genuinely native fan forms, and its governing rule is that the edit obeys the song, not the show. Cuts land on the beat. A four-second shot gets one second. A character walks into frame and is gone before you have placed them, because the snare arrived.",
      "It works here because Jujutsu Kaisen is unusually rich in single-frame identifiers — Gojo's blindfold and white hair, Sukuna's markings, the specific violet of Hollow Purple against a night street. You need roughly a third of a second to recognise any of them, which is exactly the budget a beat-locked edit can afford. A series with subtler character design would turn to mush at this cadence.",
      "What the form cannot do is argue. There is no claim being made here about the story, and looking for one is a category error; the pleasure is rhythmic and associative, closer to a remix than to criticism. The editor, credited on the end card as Babyartmusicpickle, is doing musicianship with someone else's footage.",
    ],
  },
  // ─────────────────────────────── MANGA ───────────────────────────────
  {
    category: "manga",
    title: "One Piece's Panel Economy",
    type: "article",
    genre: ["Craft", "Layout"],
    year: 2025,
    popularity: 94,
    summary:
      "A thousand-plus chapters is not sustainable on detail alone. The layouts are doing something much more deliberate than they look.",
    art: "manga-one-piece.jpg",
    paragraphs: [
      "The pages look chaotic and are not. Oda runs a tight rhythm underneath the density: establishing panel, two or three reaction beats at speed, then one panel given the width of the page. The dense panels are cheap to read; the wide one is where the chapter spends its attention.",
      "That rhythm is why a chapter with thirty characters on screen never loses its footing. Crowds are drawn as texture rather than as individuals, and the reader's eye is pulled through them by a single clear silhouette. Recognition is doing the navigation that panel borders normally have to.",
      "It also explains the pacing complaints. Arcs feel slow in weekly instalments and read fast in volume, because the rhythm was built for the collected page turn rather than the seven-day gap. The layout knows which format it is for.",
    ],
  },
  {
    category: "manga",
    title: "What Naruto Got Right About Training Arcs",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2025,
    popularity: 89,
    summary:
      "The genre's most-mocked device, done properly: the training has to change who someone is, not what they can lift.",
    art: "manga-naruto.jpg",
    paragraphs: [
      "The training arc has a bad reputation because it is usually a delay dressed as development — the character learns a technique, the technique wins the next fight, nothing else moves. The good ones in Naruto do something different: the technique is incidental, and the relationship formed while learning it is the actual acquisition.",
      "The tree-climbing exercise is the cleanest example. Mechanically it teaches chakra control. Structurally it is the first time the cast has to cooperate without being told to, and the series cashes that in for the next several hundred chapters.",
      "Where the series slips is when it forgets its own rule and hands out power as a reward for suffering rather than for change. The difference is visible on the page: the good arcs end with a different person, the weak ones end with a bigger number.",
    ],
  },
  {
    category: "manga",
    title: "Dragon Ball Invented the Power Level Problem and Never Solved It",
    type: "audio",
    genre: ["Discussion", "History"],
    year: 2024,
    popularity: 91,
    summary:
      "Putting a number on strength was a gag. It became the genre's most durable structural trap, and the series that coined it escaped by ignoring it.",
    art: "manga-dragon-ball.jpg",
    timeline: [
      {
        label: "1984",
        title: "Dragon Ball begins serialisation",
        body: "A comedy adventure loosely following Journey to the West. Fights are settled by wit and training, and nobody has a number attached to them.",
      },
      {
        label: "1989",
        title: "The scouter arrives",
        body: "Saiyan technology puts a readable figure on a fighter's strength. It works as a joke and as a threat — and quietly commits the series to arithmetic.",
      },
      {
        label: "1991",
        title: '\\"It\'s over 9000\\"',
        body: "The line that outlived the series. The scale breaks on screen, which is the first sign that a number the reader can track is a number the author has to keep beating.",
      },
      {
        label: "1992",
        title: "Super Saiyan tiers begin",
        body: "Grades 2 and 3, then Super Saiyan 2. Each rung re-bases the scale, and every previously terrifying opponent is retroactively demoted.",
      },
      {
        label: "1996",
        title: "Power levels quietly retired",
        body: "The scouter is gone and the figures stop being quoted. The problem does not go away; it is simply no longer measured out loud.",
      },
      {
        label: "2015",
        title: "Dragon Ball Super inherits it",
        body: "Gods, angels and Ultra Instinct. The series spends its sequel solving the same escalation problem it created thirty years earlier.",
      },
    ],
    paragraphs: [
      "The scouter was a joke about bureaucratic invaders who measure everything. Once readers had a number, though, they started doing arithmetic, and arithmetic is fatal to tension — a fight whose outcome can be calculated in advance is a fight with no question in it.",
      "The series' escape route was to break its own instrument. Numbers stop being quoted, transformations stop being quantified, and strength returns to being something demonstrated rather than stated. It is a retreat, and it works.",
      "Everything downstream inherited the trap without inheriting the escape. Ranks, grades, levels and stat screens all promise legibility and all deliver the same problem: the more precisely a series measures power, the fewer fights it can make interesting.",
    ],
  },
  {
    category: "manga",
    title: "Tokyo Ghoul's Ink Gets Darker as Kaneki Does",
    type: "article",
    genre: ["Craft", "Art"],
    year: 2025,
    popularity: 87,
    summary:
      "The clearest case in modern manga of art style doing characterisation. You read the transformation in the blacks before the script confirms it.",
    art: "manga-tokyo-ghoul.png",
    paragraphs: [
      "Early chapters are open: generous whites, thin lines, panels with air in them. As the story proceeds the blacks expand — screentone gives way to solid fill, backgrounds close in, and the white space that made the art readable is steadily eaten.",
      "It is characterisation you absorb without noticing. By the time the script confirms what has happened to him, the reader has been reading it for dozens of pages in the density of the page itself. That is a trick available to comics and almost nothing else.",
      "The mask is the other half. A restraint device drawn as a grin, worn by someone who cannot stop apologising — a single design carrying the whole contradiction, which is why it outlived the series in popular memory.",
    ],
  },
  {
    category: "manga",
    title: "Reading a Miura Two-Page Spread",
    type: "image",
    genre: ["Craft", "Layout"],
    year: 2024,
    popularity: 90,
    summary:
      "Berserk's famous spreads are not just detailed. They are constructed so the eye arrives at the right place, and the detail is what slows it down on the way.",
    art: "manga-berserk.jpg",
    paragraphs: [
      "The instinct with a dense spread is to look everywhere at once, which is exactly what the composition prevents. There is almost always a high-contrast corridor — a path of light values through dark — that the eye follows whether or not the reader notices.",
      "The hatching is doing two jobs. It builds the texture the pages are famous for, and it controls reading speed: dense crosshatch is slow to parse, open areas are fast. Miura paces a page the way a director paces a scene, with the pen rather than with the cut.",
      "It is also why the spreads survive reproduction at any size. The structure is in the value composition rather than the line detail, so a thumbnail still reads correctly even when the hatching collapses into grey.",
    ],
  },
  {
    category: "manga",
    title: "Vagabond and the Art of the Unfinished",
    type: "article",
    genre: ["Criticism", "Craft"],
    year: 2024,
    popularity: 84,
    summary:
      "An indefinite hiatus is usually a tragedy for a series. Here it produced something the finished version might not have managed.",
    art: "manga-vagabond.png",
    paragraphs: [
      "The late chapters abandon ink for brush, and the brush abandons precision. Figures become gesture; backgrounds become tone. Read in sequence, the art is visibly moving away from the thing that made it famous.",
      "That drift is not decline. The story had arrived at a character trying to stop being a swordsman, and the drawing loosened in step with him. It is rare to watch a comic's technique and its subject converge this precisely.",
      "Whether it resumes is almost beside the point now. What exists is a work that ends mid-sentence on a character mid-change, and the incompleteness has become part of what it is about.",
    ],
  },
  {
    category: "manga",
    title: "The Weekly Chapter: What Serialisation Does to a Story",
    type: "audio",
    genre: ["Discussion", "Industry"],
    year: 2026,
    popularity: 80,
    summary:
      "A conversation about the deadline as a co-author — why weekly manga is shaped the way it is, and what gets lost when a series escapes the schedule.",
    art: "kakashi-alley.jpg",
    paragraphs: [
      "Weekly serialisation imposes a shape before a single page is drawn: roughly nineteen pages, a hook on the last one, and a cast that has to be reintroduced constantly because readers have had seven days to forget. Those are not creative choices, and they end up producing most of the medium's conventions anyway.",
      "The discussion turns on what happens when a creator escapes it. Monthly and quarterly schedules produce denser, better-drawn work that frequently loses the propulsion weekly readers took for granted, and several famous hiatuses are really stories about a rhythm that stopped fitting.",
      "There is also the reader's side. The gap is where fandom lives — theories, arguments, re-reads — and a series binged in a weekend never generates it. The deadline is not only shaping the work; it is manufacturing the audience.",
    ],
  },

  // ────────────────────────────── COMICS ───────────────────────────────
  {
    category: "comics",
    title: "Solo Leveling and the Vertical Scroll",
    type: "article",
    genre: ["Craft", "Webtoon"],
    year: 2026,
    popularity: 95,
    summary:
      "The webtoon format is not a comic page turned sideways. It has its own unit of timing, and this series is the clearest demonstration of it.",
    art: "comics-solo-leveling.jpg",
    paragraphs: [
      "A printed page reveals everything at once; the reader's eye can cheat ahead. A vertical scroll reveals strictly in order and at a speed the reader controls with a thumb. That single difference changes where a reveal can be placed and how long it can be withheld.",
      "This series exploits it with empty space. Long gaps of black or near-black between panels are not padding — they are duration, the scroll equivalent of holding a shot. By the time the next image arrives, the reader has spent real seconds waiting for it.",
      "It is why full-width drops land so hard. The panel is not just larger; it has been preceded by a deliberate stretch of nothing. Print has no clean equivalent, which is why adaptations of scroll comics so often feel flattened.",
    ],
  },
  {
    category: "comics",
    title: "Tower of God Asks You to Trust It for Fifty Chapters",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2025,
    popularity: 86,
    summary:
      "An opening that withholds almost everything is a gamble. What it buys, when it pays off, is a reader who reads differently.",
    art: "comics-tower-of-god.jpg",
    paragraphs: [
      "The early chapters refuse the usual contract. Terminology arrives unexplained, the rules of the world are demonstrated rather than stated, and the protagonist knows less than the reader would like. Plenty of people stop, and that is a real cost rather than a filter.",
      "The payoff is a reading posture. Because nothing was handed over, the reader learns to treat detail as load-bearing, and by the time the structure resolves, they have been doing the work of inference for so long that the resolution feels earned rather than delivered.",
      "The risk is that a series like this can never simplify later without feeling like a betrayal. Having trained an audience to read closely, it owes them something worth reading closely — a debt that compounds with every arc.",
    ],
  },
  {
    category: "comics",
    title: "Omniscient Reader's Viewpoint Is a Story About Reading",
    type: "article",
    genre: ["Criticism", "Meta"],
    year: 2026,
    popularity: 88,
    summary:
      "A protagonist who has already read the novel he is living in. The premise sounds like a gimmick and turns out to be a thesis about fandom itself.",
    art: "comics-omniscient-reader.jpg",
    paragraphs: [
      "The setup gives its lead the one advantage no character normally has: he knows the plot. That should kill tension outright, and the series survives it by making the knowledge decay — the moment he acts, the story diverges, and his advantage begins expiring.",
      "What makes it more than a clever engine is who he is. He is not a hero; he is a reader, with a reader's relationship to these people. He has opinions about them formed before meeting them, and the series is genuinely interested in how unfair that is to the actual person standing in front of him.",
      "That is a sharper piece of writing about fandom than most stories that set out to be about fandom. Knowing a character deeply and knowing them at all turn out to be different things.",
    ],
  },
  {
    category: "comics",
    title: "Noblesse and the Long Webtoon Problem",
    type: "article",
    genre: ["Criticism", "Industry"],
    year: 2024,
    popularity: 78,
    summary:
      "Five hundred-plus chapters changes what a series is. The early tone and the late tone belong to different works, and the seam is instructive.",
    art: "comics-noblesse.png",
    paragraphs: [
      "It opens as a school comedy with a vampire in it and ends as a war story about obligation. Neither is a mistake; the difficulty is that a reader arriving at chapter four hundred is reading a series that no longer resembles what it advertised.",
      "Length does this to webtoons more than to print comics, because the format has no volumes to mark eras. A reader can scroll from the comedy to the war without a single edition break signalling that the ground has moved.",
      "The lesson most successors took was to plan the tonal arc up front. The ones that did not now share the same shape: a beloved early run, a respected late run, and an argument in the comments about which is the real series.",
    ],
  },
  {
    category: "comics",
    title: "The Breaker: Choreography in a Medium With No Motion",
    type: "article",
    genre: ["Craft", "Breakdown"],
    year: 2025,
    popularity: 83,
    summary:
      "Martial arts comics have to convey technique using still images. A breakdown of the panel grammar that makes a strike legible.",
    art: "comics-the-breaker.jpg",
    paragraphs: [
      "The problem is specific: a technique is a sequence of weight shifts, and a still image can only show one instant of it. Choosing the wrong instant makes an expert strike look like a man falling over.",
      "The solution this series leans on is the before-and-after pair. Rather than drawing the blow, it draws the stance that makes the blow inevitable and then the result, and lets the reader's body fill in the middle. Readers who have never thrown a punch still feel the transfer.",
      "Where it does draw the moment of contact, it changes register — fewer lines, heavier blacks, a background that drops out entirely. The shift in drawing style functions as a change in shutter speed.",
    ],
  },
  {
    category: "comics",
    title: "Colour Is Not Decoration in Manhwa",
    type: "article",
    genre: ["Craft", "Colour"],
    year: 2026,
    popularity: 89,
    summary:
      "Full colour is the format's default rather than a premium edition, which makes palette a structural tool instead of a finish.",
    art: "jinwoo-monarch.jpg",
    paragraphs: [
      "Western comics treat colour as a production stage applied over finished line art. Webtoons are usually coloured as they are composed, which means hue can carry information the linework never has to duplicate.",
      "The most common use is chapter-scale mood keying: an arc runs cold, then a single sequence goes warm, and the reader registers the shift before reading a word. On a vertical scroll, where there is no page spread to establish a scene, that keying does the work an establishing shot would.",
      "The failure mode is equally visible — series where every panel is maximally saturated have spent the instrument on nothing, and lose the ability to signal anything by changing it.",
    ],
  },
  {
    category: "comics",
    title: "One Silent Character, One Palette",
    type: "image",
    genre: ["Craft", "Design"],
    year: 2025,
    popularity: 82,
    summary:
      "A summoned knight with no dialogue holds more visual weight than most speaking casts. The design is doing all of it.",
    art: "igris-shadow-knight.jpg",
    paragraphs: [
      "A character with no lines has to be legible in silhouette, because that is the only channel available. The build here is deliberately simple at thumbnail scale — a single unmistakable outline that survives being small, dark and in motion.",
      "The colour choice is the sharper decision. In a series shot almost entirely in blues and blacks, one warm accent is the only heat on most pages he appears on. That is not ornament; it is how a mute character claims focus in a crowded panel.",
      "The gesture completes it. One repeated action, used sparingly, does the work dialogue would — and because it never varies, each repetition reads as the same promise being renewed.",
    ],
  },

  // ─────────────────────────────── MOVIES ──────────────────────────────
  {
    category: "movies",
    title: "Deadpool & Wolverine Is a Legacy Film About Legacy Films",
    type: "article",
    genre: ["Criticism", "Blockbuster"],
    year: 2026,
    popularity: 94,
    summary:
      "A sequel whose real subject is the corporate machinery that produced it. That is either the joke or the problem, depending on where you sit.",
    art: "movies-deadpool-wolverine.jpg",
    paragraphs: [
      "The film's central gag is that it knows what it is: a product assembled from acquired properties, aware of the acquisition, and willing to say so out loud. Self-awareness is offered as the defence and, for long stretches, it genuinely is one.",
      "What complicates it is that the emotional beats are played straight. The film wants credit for mocking the sentimentality of legacy casting and credit for the sentimentality, which is a difficult double to land and does not always land here.",
      "It works best when the two characters are simply in a room. Strip the meta-commentary and what remains is an odd-couple comedy with unusually good timing — the part of the film that would survive without a single reference in it.",
    ],
  },
  {
    category: "movies",
    title: "Interstellar's Sound Mix Is the Argument",
    type: "article",
    genre: ["Craft", "Sound"],
    year: 2025,
    popularity: 92,
    summary:
      "The complaints about buried dialogue treat the mix as a mistake. It is a choice, and the film is fairly explicit about why.",
    art: "movies-interstellar.jpg",
    paragraphs: [
      "The organ does not sit under the scene; it competes with it. Dialogue is regularly lost beneath it, and audiences noticed loudly enough that the mix became a story in itself.",
      "The intent is legible once you accept it as deliberate. The film is about scale overwhelming individual human communication — parents and children unable to reach each other across distance and time — and the mix enacts that rather than describing it. You are made to strain, and straining is the subject.",
      "Whether that justifies it is a fair argument. A film that makes its point by degrading its own legibility has to be sure the point is worth the cost, and reasonable viewers land on both sides of that ledger.",
    ],
  },
  {
    category: "movies",
    title: "John Wick and the Return of Legible Action",
    type: "article",
    genre: ["Craft", "Action"],
    year: 2025,
    popularity: 96,
    summary:
      "After a decade of shaky-cam and three-frame cuts, one film argued that audiences would rather see what is happening. A breakdown of the grammar.",
    art: "movies-john-wick.jpg",
    paragraphs: [
      "The default action grammar of the 2000s hid its choreography: close framing, handheld camera, cuts fast enough to imply speed the performers did not need to produce. It made competent fights out of actors who could not fight, and it made every fight look the same.",
      "The correction here is unglamorous. Wider lenses, longer takes, the whole body in frame, and cuts placed on movement rather than on impact. None of it is new — it is Hong Kong grammar reimported — but reintroducing it to American blockbusters reset audience expectations within a single film.",
      "The knock-on effect is casting. Legible action requires performers who can actually execute, which changed who gets hired for these roles and how long they train. A stylistic choice turned into an industrial one.",
    ],
  },
  {
    category: "movies",
    title: "The Avengers Set a Template Nobody Has Escaped",
    type: "audio",
    genre: ["Discussion", "Industry"],
    year: 2024,
    popularity: 90,
    summary:
      "The crossover worked so completely that it stopped being a film and became a format — including for studios with nothing to cross over.",
    art: "movies-avengers.jpg",
    timeline: [
      {
        label: "2008",
        title: "Iron Man, and a post-credits scene",
        body: "Nick Fury walks into Tony Stark's living room for thirty seconds. A studio tells the audience, for the first time, that the film they just watched was also an advertisement.",
      },
      {
        label: "2008–2011",
        title: "Five films of setup",
        body: "The Incredible Hulk, Iron Man 2, Thor, Captain America. Each carries a subplot it does not need, because the assembly needs it.",
      },
      {
        label: "2012",
        title: "The Avengers",
        body: "The gamble lands. A crossover earns $1.5bn and the post-credits scene stops being a gag and becomes a contractual obligation.",
      },
      {
        label: "2013–2017",
        title: "Everyone builds a universe",
        body: "Universal's Dark Universe, Sony's Amazing Spider-Man spin-offs, Warner's DCEU. Most begin with a shared-world announcement before they have a first film that works.",
      },
      {
        label: "2019",
        title: "Endgame",
        body: "The template's proof and its ceiling. Twenty-two films of accumulated investment pay off, and the bar for a satisfying crossover moves out of reach of anyone starting now.",
      },
      {
        label: "2021–",
        title: "The cost comes due",
        body: "Audiences start describing homework. The structure that made the payoff possible is the same structure that makes each individual film feel like a chapter.",
      },
    ],
    paragraphs: [
      "The achievement was structural rather than spectacular. Assembling characters from separate films, giving each a reason to be present and a moment to justify the ticket, and resolving it in one legible location — that is a screenwriting problem most attempts underestimate.",
      "The third act is the part everyone copied and the part that travels worst. It works here because the geography is established early and never cheats; the audience always knows where everyone is. Later imitations kept the scale and dropped the map.",
      "The deeper legacy is the expectation that a film is an instalment. That is a commercial triumph and a narrative tax: every subsequent entry owes setup to films that do not exist yet, and pays interest on films that already did.",
    ],
  },
  {
    category: "movies",
    title: "Fellowship Is the Best-Edited of the Three",
    type: "article",
    genre: ["Craft", "Editing"],
    year: 2024,
    popularity: 93,
    summary:
      "The trilogy's reputation rests on spectacle. Its first instalment is the one that is actually assembled better, and the difference is in the quiet scenes.",
    art: "movies-lotr-fellowship.jpg",
    paragraphs: [
      "The later films have larger battles and more cross-cutting, which reads as more editing. Fellowship has something harder: a single unbroken travelling party, which means every scene has to justify its own length without a second storyline to cut away to.",
      "Watch the council scene. It is a long sequence of people talking in one location, and it holds because the cutting is motivated by argument rather than by rhythm — each cut lands on someone reacting, so exposition plays as conflict.",
      "The trilogy's structure works against its successors from then on. Once the party splits, the films can always generate momentum by cutting between threads, which is easier and slightly cheaper. The first film never had that option and is tighter for it.",
    ],
  },
  {
    category: "movies",
    title: "The Prestige Tells You the Trick in the First Line",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2025,
    popularity: 91,
    summary:
      "A film about misdirection that misdirects by being honest. The structure is the con, and it announces itself before the title card.",
    art: "movies-the-prestige.jpg",
    paragraphs: [
      "The opening narration lays out the three-act structure of a magic trick, then the film performs exactly that structure on the audience. Telling you the method in advance is itself the method, because knowing the shape of a trick does not stop it working.",
      "The editing is where the misdirection lives. The film cuts between two timelines in a way that invites you to assume causality that is not there, and every apparent flash-forward is doing double duty as a concealment.",
      "It is a rare puzzle film that survives the reveal. Re-watching does not deflate it, because the pleasure was never the answer — it was watching two men destroy themselves over a question the film told you the shape of in its first minute.",
    ],
  },
  {
    category: "movies",
    title: "Titanic's Production Design, Decades On",
    type: "image",
    genre: ["Craft", "Design"],
    year: 2024,
    popularity: 85,
    summary:
      "The effects have aged unevenly. The sets have not aged at all, and the reason is a decision made before a frame was shot.",
    art: "movies-titanic.jpg",
    paragraphs: [
      "The film's composite shots show their age in the way all digital work of that era does. The physical build does not, because the production put its money into scale rather than into simulation — corridors and staircases constructed at size, which photograph the same in any decade.",
      "The detail work compounds it. Fixtures, upholstery and cutlery were reproduced rather than approximated, so close-ups carry the same authority as the wides. That matters more than it sounds: a viewer forgives a suspect wide shot if every intimate shot is unimpeachable.",
      "It is a useful reminder as budgets tilt further toward post-production. Physical sets do not depreciate, and everything rendered eventually looks like the year it was rendered in.",
    ],
  },

  {
    category: "movies",
    title: "Watch: “Your Idol”, Redrawn in Silhouette",
    type: "video",
    genre: ["Animation", "Fan Work"],
    year: 2026,
    popularity: 88,
    summary:
      "A fan animation of the KPop Demon Hunters number that works almost entirely in silhouette against flat colour. The constraint turns out to be the point.",
    art: "video-your-idol-fan-animation.jpg",
    media: "your-idol-kpop-demon-hunters",
    paragraphs: [
      "Almost nothing in this is rendered. The performers are black shapes — wide-brimmed hats, long coats, the occasional glint of an eye — thrown against fields of flat teal, red and hot pink. A single animator cannot shade and light a group dance number, so this one simply refuses to try.",
      "The refusal buys something real. Silhouette is the cheapest way to keep choreography legible, because the eye reads a pose from its outline long before it reads a face. Three figures with identical hats moving in unison are perfectly clear here, where three half-shaded figures would have been a smear. The professional version of this trick is a concert lighting rig; the amateur version is a black shape on a colour field, and they are the same idea.",
      "The one moment that breaks the rule earns its exception: a close-up of a face, yellow-eyed and lit from below, dropped into a run of pure silhouette. When you have spent a minute refusing detail, a single detailed frame does the work of a whole sequence.",
    ],
  },
  // ───────────────────────────── TV SHOWS ──────────────────────────────
  {
    category: "tv-shows",
    title: "Peaky Blinders Uses Music the Way Westerns Use Landscape",
    type: "article",
    genre: ["Craft", "Sound"],
    year: 2025,
    popularity: 93,
    summary:
      "The anachronistic soundtrack is the most-discussed thing about the show and the least accidental. It is doing a job the period setting cannot.",
    art: "tv-peaky-blinders.jpg",
    paragraphs: [
      "Dropping a modern rock track into 1920s Birmingham should break the illusion and instead reinforces it. The effect is the same one a western gets from a landscape shot: it tells you what register to watch in, before any character does anything.",
      "It also solves a specific period-drama trap. Faithful period scoring tends to make audiences watch at a museum distance, treating characters as historical artefacts. A contemporary needle-drop collapses that distance and insists these are people rather than costumes.",
      "The show is disciplined about where it spends it. The tracks arrive on entrances and transitions, almost never under dialogue, which keeps them functioning as punctuation. Used continuously, the same device would flatten into a music video.",
    ],
  },
  {
    category: "tv-shows",
    title: "Game of Thrones and the Cost of Outrunning Your Source",
    type: "article",
    genre: ["Criticism", "Adaptation"],
    year: 2024,
    popularity: 95,
    summary:
      "The final seasons are usually blamed on rushing. The more precise diagnosis is that the show lost the thing it had been adapting: interiority.",
    art: "tv-game-of-thrones.jpg",
    timeline: [
      {
        label: "1996",
        title: "A Game of Thrones published",
        body: "A fantasy series built on slow political consequence, where the plot advances because characters make decisions with reasons behind them.",
      },
      {
        label: "2011",
        title: "The series premieres",
        body: "Season one adapts one book. The adaptation has a full novel of material and a year to shoot it.",
      },
      {
        label: "2011",
        title: "A Dance with Dragons",
        body: "The fifth novel. It is also, though nobody knows it yet, the last one the series will have to work from.",
      },
      {
        label: "2016",
        title: "Season six passes the books",
        body: "The adaptation runs out of source. What it loses is not plot — the endings were known — but the connective reasoning between them.",
      },
      {
        label: "2017–2019",
        title: "Seasons shorten, travel speeds up",
        body: "Seven episodes, then six. Characters cross the continent between scenes, because the remaining beats have to be reached and there is no longer a novel pacing them.",
      },
      {
        label: "2019",
        title: "The finale",
        body: "A million-signature petition to remake it. The destinations were largely the ones the author had planned; the argument was about everything that used to happen between them.",
      },
    ],
    paragraphs: [
      "For most of its run the series had access to something television cannot easily film — chapters written from inside a character's head. The adaptation externalised that interiority into conversation, and the famously good early seasons are largely people explaining themselves to each other in rooms.",
      "Once the source ran out, the scaffolding went with it. The later seasons still move characters to the same destinations, but the reasoning that made those destinations feel inevitable was the part that had been in the prose.",
      "That is why compressed pacing is only half the complaint. Speed is survivable when motivation is legible; what viewers actually registered was decisions arriving without the interior argument that used to precede them.",
    ],
  },
  {
    category: "tv-shows",
    title: "Wednesday's Deadpan Only Works Because Everyone Else Is Loud",
    type: "article",
    genre: ["Criticism", "Comedy"],
    year: 2026,
    popularity: 88,
    summary:
      "A flat-affect lead is a comic instrument that needs an orchestra behind it. The show's production design is the joke's straight man.",
    art: "tv-wednesday.jpg",
    paragraphs: [
      "A completely unreactive protagonist is difficult to build a series around — without contrast, deadpan reads as absence. The solution here is environmental: the world is maximalist in colour, costume and set dressing, so the lead's flatness is measured against something every second she is on screen.",
      "The casting extends it. Supporting performances are pitched broadly on purpose, which would be a flaw in a different show and is load-bearing in this one. Every over-reaction is a setup whose punchline is someone not reacting.",
      "The risk is that the device cannot escalate. Deadpan has one volume, so the series has to find variety in what it is deadpan *about* — and the episodes that work least are the ones that simply ask for the same non-reaction again.",
    ],
  },
  {
    category: "tv-shows",
    title: "House of the Dragon Solved the Time-Skip Problem by Refusing To",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2026,
    popularity: 89,
    summary:
      "Recasting mid-season is supposed to be a disaster. Committing to it completely turned out to be less disruptive than easing the audience in.",
    art: "tv-house-of-the-dragon.jpg",
    paragraphs: [
      "Most productions dread the jump forward, and hedge: ageing makeup, careful lighting, a single actor stretched across two decades. The hedge usually produces something worse than a recast, because the audience spends the whole time noticing the prosthetics.",
      "The decision to simply swap performers, in the middle of a season, without softening the transition, is more disruptive for one episode and considerably less disruptive thereafter. Viewers recalibrate faster than producers assume.",
      "What makes it hold is continuity of behaviour rather than of appearance. The new performances inherit specific gestures and speech rhythms, so recognition happens through mannerism. Faces are the easiest thing to replace if the habits survive.",
    ],
  },
  {
    category: "tv-shows",
    title: "The Economics of the Twenty-Two Episode Season",
    type: "article",
    genre: ["Industry", "Breakdown"],
    year: 2025,
    popularity: 84,
    summary:
      "Long network seasons are remembered as bloated. They were also a training ground the streaming model no longer provides.",
    art: "tv-vampire-diaries.jpg",
    paragraphs: [
      "Twenty-two episodes a year forces a production to make things it has not fully planned. Some of that is filler, and the complaint is fair. The rest is a rehearsal space — writers, directors and performers accumulating reps at a rate an eight-episode season cannot match.",
      "It also changes what a character can be. Long seasons have room for an arc to reverse, fail and restart, which makes redemption and relapse actually dramatizable. Short seasons tend to move characters in one direction because there is no room to move them back.",
      "The trade is obvious in quality-per-hour and less obvious in what it cost the pipeline. A generation of showrunners learned the job at volume, and the current model has no equivalent on-ramp.",
    ],
  },
  {
    category: "tv-shows",
    title: "Lucifer's Procedural Skeleton Is Why the Fantasy Works",
    type: "article",
    genre: ["Criticism", "Genre"],
    year: 2024,
    popularity: 79,
    summary:
      "A case-of-the-week structure under a supernatural premise looks like a compromise. It is actually what keeps the premise legible.",
    art: "tv-lucifer.jpg",
    paragraphs: [
      "High-concept premises decay when everything is negotiable. A procedural spine fixes the rules by repetition: the same shape of story every week, with one supernatural variable, so the audience learns exactly what the fantasy can and cannot do.",
      "It also gives the ongoing arc somewhere to hide. Serialised development lands harder when it interrupts a familiar structure — a week where the formula breaks means something precisely because forty weeks did not.",
      "The cost is ceiling. A show built this way rarely produces a transcendent hour, because the format that guarantees the floor also caps the roof. Most series in this mode are trading peaks for reliability, usually knowingly.",
    ],
  },
  {
    category: "tv-shows",
    title: "Death Note's First Episode Is a Masterclass in Setup",
    type: "article",
    genre: ["Criticism", "Structure"],
    year: 2025,
    popularity: 94,
    summary:
      "Twenty-three minutes that establish a premise, a moral position, and the exact terms of its collapse. Almost nothing is wasted.",
    art: "tv-death-note.jpg",
    paragraphs: [
      "The episode has to do four things: explain a supernatural object, make its rules feel binding, establish a protagonist worth following, and plant the flaw that will destroy him. It does all four without a scene that exists only to explain.",
      "The rules arrive through use rather than exposition. He tests the notebook, and each test is simultaneously a demonstration of mechanics and of character — what a person chooses to test first tells you everything about them.",
      "The flaw is planted in the same motion. His certainty is introduced as competence, and the series spends the rest of its run revealing that competence and certainty were never the same thing. The reversal is already loaded in episode one.",
    ],
  },

  {
    category: "tv-shows",
    title: "Watch: The Vampire Diaries, Titled Like Teen Wolf",
    type: "video",
    genre: ["Fan Work", "Design"],
    year: 2025,
    popularity: 86,
    summary:
      "Someone rebuilt one show's main titles using a different show's visual grammar. The result proves that a title sequence is a promise about genre, not a summary of plot.",
    art: "video-vampire-diaries-titles.jpg",
    media: "vampire-diaries-teen-wolf-titles",
    timeline: [
      {
        label: "2009",
        title: "The Vampire Diaries premieres",
        body: "Its own titles are brief, soft-focus and moody — a romance that happens to have fangs, and the sequence says so before a line is spoken.",
      },
      {
        label: "2011",
        title: "Teen Wolf premieres",
        body: "A different promise: bodies coming apart into smoke and particles in a white void, name cards in thin serif. Body horror with a cast list.",
      },
      {
        label: "2011–2017",
        title: "Both run in parallel",
        body: "Two shows in overlapping territory on overlapping networks, each telling its audience something different in the first forty seconds.",
      },
      {
        label: "2017–",
        title: "The fan edit",
        body: "Someone swaps one grammar onto the other cast. Same performers, same series, an entirely different show — which is the whole argument about what main titles are for.",
      },
    ],
    paragraphs: [
      "The formula is borrowed wholesale: a performer stands in a white void, arms opening, body coming apart into smoke and particles, name card in a thin serif. It is Teen Wolf's sequence almost shot for shot, with The Vampire Diaries' cast standing in — Nina Dobrev, Candice Accola King, Michael Malarkey, each dissolving in turn.",
      "The interesting part is how completely it relabels the show. The series' own titles were brief, moody and soft-focus: a romance that happens to have fangs. This version, with its cold white space and bodies visibly disintegrating, reads as body horror with a cast list. Same performers, same series, entirely different promise about what the next forty minutes contain.",
      "Main titles are doing genre triage. They tell a viewer which set of expectations to load before a single line is spoken, which is why networks fight over them and why swapping one wholesale is such an efficient prank. Nothing about the show changed. Only the instructions did.",
    ],
  },
  // ─────────────────────────────── K-POP ───────────────────────────────
  {
    category: "k-pop",
    title: "BLACKPINK's Visual Grammar Is Built for the Still Frame",
    type: "article",
    genre: ["Craft", "Design"],
    year: 2026,
    popularity: 95,
    summary:
      "Concept photography is not promotion for the music. In this system it is a parallel release, and it is composed accordingly.",
    art: "kpop-blackpink-roses.jpg",
    paragraphs: [
      "Concept shoots are built to be cropped. Compositions hold at square, at portrait and at banner ratios, because the image's real distribution is a feed rather than a sleeve, and an image that only works at one ratio is an image that mostly does not work.",
      "Colour carries the era. A comeback is signalled by palette before a single note is heard, and fans read the shift accurately — which is why the concept reveal reliably outperforms the teaser in engagement.",
      "The group photography solves a harder problem: four people who must each read as individually legible and collectively symmetrical. Staggered heights, one asymmetric element, and eyelines split rather than uniform. It looks effortless and is blocked like a stage.",
    ],
  },
  {
    category: "k-pop",
    title: "The Concept Film as a Format",
    type: "article",
    genre: ["Craft", "Video"],
    year: 2025,
    popularity: 93,
    summary:
      "Not a music video, not a trailer. A distinct form with its own rules, and one of the few genuinely new formats the streaming era produced.",
    art: "kpop-bts-black-swan.jpg",
    paragraphs: [
      "The concept film sits between a teaser and a short: too long to be an advert, too abstract to be a narrative. Its job is to establish a visual and emotional key for a release without spending the release's actual footage.",
      "The form's defining constraint is that it usually cannot use the song properly. Working with fragments, or with score written specifically for it, forces a reliance on movement and image that most music videos never need — which is why the best examples read as dance films.",
      "It also functions as a contract with the audience. A concept film announces how seriously a comeback intends to be taken, and fans read that signal precisely. Getting it wrong is a bigger problem than a weak teaser.",
    ],
  },
  {
    category: "k-pop",
    title: "Stray Kids Write Their Own Noise",
    type: "article",
    genre: ["Criticism", "Production"],
    year: 2026,
    popularity: 91,
    summary:
      "Self-production in idol music is usually a credit rather than a sound. Here it is audible, and it is what makes the discography cohere.",
    art: "kpop-stray-kids-group.jpg",
    paragraphs: [
      "The tell is the arrangement rather than the songwriting. Tracks assembled in-house tend to keep decisions an external producer would smooth out: abrupt section changes, unresolved transitions, mixes that leave something ugly in on purpose.",
      "That roughness is the group's signature and its commercial risk. It produces a catalogue with a recognisable spine, and it also produces songs that do not behave the way a radio edit is supposed to.",
      "The structural point is about control. A group that can generate its own material is not waiting on a label's A&R cycle, which changes release cadence and, over several years, changes what kind of career is available to it.",
    ],
  },
  {
    category: "k-pop",
    title: "(G)I-DLE and the Self-Produced Idol",
    type: "article",
    genre: ["Criticism", "Industry"],
    year: 2026,
    popularity: 90,
    summary:
      "When the member writing the title track is also performing it, the usual distance between persona and author collapses — and the concept work gets stranger for it.",
    art: "kpop-gidle.jpg",
    paragraphs: [
      "Most idol concepts are assigned. Someone else decides the era, the palette and the persona, and the performer's job is to inhabit it convincingly. That division is not a scandal; it is how the industry is built, and plenty of great records come out of it.",
      "Removing the division changes what the concept can be about. A self-written title track can comment on the persona it is delivering, which produces the reflexive, slightly antagonistic eras this group is known for — material that would be difficult for an outside writer to pitch and harder for a label to approve.",
      "The cost is that there is nowhere to hide. An assigned concept that fails is a strategy problem. A self-authored one that fails is read as the artist, which is a heavier thing to carry into the next comeback.",
    ],
  },
  {
    category: "k-pop",
    title: "The Shortest, Densest Record",
    type: "audio",
    genre: ["Review", "Album"],
    year: 2025,
    popularity: 87,
    summary:
      "A debut album under half an hour long, with no obvious filler and no room to breathe. A listen through what that compression costs and buys.",
    art: "kpop-blackpink-the-album.jpg",
    paragraphs: [
      "Short records are a strategic choice as much as an artistic one. Every track has to justify its slot against streaming metrics that punish skips, which pushes an album toward all-singles and away from the sequencing that makes an album feel like one thing.",
      "The compression is audible in the transitions. There is very little connective tissue — no interludes, few fades — so the listen is a sequence of arrivals rather than a journey. That is exhilarating once and slightly exhausting on repeat.",
      "What it buys is replay. A record this length gets finished, and finishing is what the metrics reward. The trade is legible: a set of songs that outperforms the album it belongs to.",
    ],
  },
  {
    category: "k-pop",
    title: "The Album Package as a Physical Argument",
    type: "image",
    genre: ["Craft", "Design"],
    year: 2025,
    popularity: 86,
    summary:
      "Physical sales in a streaming era only make sense if the object does something a file cannot. The photobook format is the answer the industry landed on.",
    art: "kpop-bts-map-of-the-soul.jpg",
    paragraphs: [
      "The CD is almost incidental now. What is being sold is a bound photobook with a disc in it, and the design is judged as print design — paper stock, binding, sequencing of images across a spread.",
      "Version variants get criticised as a sales mechanic, and they are. They are also, less cynically, an editorial device: multiple concepts around a single release let a campaign hold contradictory ideas without picking one.",
      "The interesting consequence is archival. A generation of pop releases will survive as objects rather than as files, which is the opposite of what everyone predicted about physical media a decade ago.",
    ],
  },
  {
    category: "k-pop",
    title: "Formations Are Camera Blocking",
    type: "article",
    genre: ["Craft", "Choreography"],
    year: 2026,
    popularity: 89,
    summary:
      "Group choreography is usually described as dance. It is at least as much a solution to the problem of where the camera will be.",
    art: "kpop-skz-ot8.jpg",
    paragraphs: [
      "An eight-person formation has to satisfy constraints a solo routine never faces: every member visible at some point, the centre rotating on a schedule, and the whole thing legible from a single fixed wide shot as well as from a moving one.",
      "The wedge and the line exist because of cameras, not because of dance history. A wedge gives depth to a frontal lens and lets the centre read without stepping forward; a line resolves cleanly when the camera tracks laterally and collapses into mush when it does not.",
      "This is why performance-video choreography often differs from the stage version. Same routine, different blocking, because the constraint changed — and fan-cam culture has made both versions equally public, which is new.",
    ],
  },

  {
    category: "k-pop",
    title: "Watch: Four Rooms, Four Palettes — “Lovesick Girls”",
    type: "video",
    genre: ["Music Video", "Design"],
    year: 2025,
    popularity: 95,
    summary:
      "The video opens on a date card and then splits into colour-separated worlds, one per member. With the sound off you can still tell whose verse it is.",
    art: "video-blackpink-lovesick-girls.jpg",
    media: "blackpink-lovesick-girls",
    timeline: [
      {
        label: "2016",
        title: "BLACKPINK debuts",
        body: "Two singles, a heavily stylised visual identity, and a colour discipline that is already doing more work than the choreography.",
      },
      {
        label: "2018",
        title: "Ddu-Du Ddu-Du",
        body: "The set-per-member structure hardens into a house grammar: each member gets a room, a palette and a verse, and the group shots exist to re-fuse them.",
      },
      {
        label: "2020.10.02",
        title: "THE ALBUM, and Lovesick Girls",
        body: "The first full-length. The title track opens on a dated wordmark rather than a scene — a release, not a story.",
      },
      {
        label: "2020",
        title: "Four rooms, four palettes",
        body: "Green garage, white flower room, red track, blue night road. Mute the video and the cut to a new colour is still the cut to a new verse.",
      },
      {
        label: "2022–",
        title: "The grammar spreads",
        body: "Colour-separated member sections become standard across the industry's tier of large-budget videos, to the point where its absence reads as a deliberate choice.",
      },
    ],
    paragraphs: [
      "It begins the way a release does rather than the way a story does: the wordmark and the date, 2020.10.02, held on black. That is a habit worth noticing — the video is treated as a dated event, not as a film, and everything after it is organised for a viewer who already knows what they came for.",
      "What follows is sorted by colour. A sickly green garage, a white room full of dried flowers, a red racetrack, a blue-black stretch of night road; each member gets a palette and a set and rarely leaves it. Mute the video and you can still follow the song's structure, because the cut to a new colour is the cut to a new verse. It is the same function a key change serves, done with a gel.",
      "The group shots then do the opposite job. Four people in one frame, lit uniformly, standing in the garage — after two minutes of separation, the reunion reads as a chorus before a note of it plays. Colour has been doing the arrangement the whole time.",
    ],
  },
  {
    category: "k-pop",
    title: "Watch: The Colour-Coded Lyric Video Is a Fan Invention",
    type: "video",
    genre: ["Fan Work", "Explainer"],
    year: 2025,
    popularity: 89,
    summary:
      "Three stacked lines, a strip of tinted member portraits, and a format nobody at a label designed. It solved a problem the official releases never addressed.",
    art: "video-exo-love-shot.jpg",
    media: "exo-love-shot-lyrics",
    timeline: [
      {
        label: "2009–2012",
        title: "Groups get larger",
        body: "Nine, twelve, thirteen members. A listener who cannot yet tell the voices apart has no way to know who is singing, and official releases never address it.",
      },
      {
        label: "2011",
        title: "Fans start colour-coding",
        body: "Subtitle groups assign each member a colour and tint their lines. The format is unofficial, unpaid and immediately legible.",
      },
      {
        label: "2013–2016",
        title: "The three-line stack settles",
        body: "Hangul, romanisation, English. Nobody standardises it; it converges anyway, because that is the layout someone singing along actually needs.",
      },
      {
        label: "2018",
        title: "Love Shot",
        body: "EXO's release gets the treatment within days, in the layout that is by now completely conventional: tinted headshot strip, three stacked lines, the current singer lit.",
      },
      {
        label: "2020–",
        title: "The default first meeting",
        body: "For most listeners outside Korea, the colour-coded version is how a song is learned — not the official video it was made from.",
      },
    ],
    paragraphs: [
      "The layout is rigidly conventional and entirely unofficial. A row of member headshots runs along the top, each one tinted and captioned with a name; beneath it sit three lines of the same lyric — Hangul, romanisation, English — and the member currently singing is lit while the rest are dimmed. Every colour-coded lyric video on the internet looks like this, and no record company drew up the spec.",
      "It exists because a nine-member group creates a genuine comprehension problem. A listener who does not read Korean and cannot yet distinguish nine voices has no way to know who is singing, and official lyric videos, which are marketing, have never cared. Fans built a teaching format instead, and the three-line stack is the giveaway: it is designed for someone who wants to follow along out loud and understand what they are saying.",
      "It is worth being clear about what this is. The format is amateur, the labour is unpaid, and it is now the default way most non-Korean listeners meet a song for the first time. “Love Shot” has an expensive official video. This is the version people actually learn the words from.",
    ],
  },
  // ─────────────────────────────── GAMING ──────────────────────────────
  {
    category: "gaming",
    title: "Elden Ring Trusts You to Get Lost",
    type: "article",
    genre: ["Criticism", "Design"],
    year: 2026,
    popularity: 97,
    summary:
      "An open world with almost no directed guidance should be frustrating. Removing the map markers is what makes the map worth reading.",
    art: "gaming-elden-ring.jpg",
    timeline: [
      {
        label: "2009",
        title: "Demon's Souls",
        body: "Sparse guidance, punishing failure, and a tone that treats the player as an adult. Commercially minor; structurally the source of everything after it.",
      },
      {
        label: "2011",
        title: "Dark Souls",
        body: "The interlocking world. Lordran folds back on itself so completely that a shortcut unlocking is a narrative event.",
      },
      {
        label: "2015",
        title: "Bloodborne",
        body: "Faster, more aggressive, and more willing to hide a third of itself behind an optional item. The studio learns how much it can withhold.",
      },
      {
        label: "2019",
        title: "Sekiro",
        body: "The posture bar. Proof the studio will rebuild its own combat from the ground up rather than iterate it.",
      },
      {
        label: "2022",
        title: "Elden Ring",
        body: "The open world arrives with the guidance deliberately left out. No quest markers, no waypoints, a map you fill in by walking — and 25 million copies in a year.",
      },
      {
        label: "2024",
        title: "Shadow of the Erdtree",
        body: "The expansion doubles down: a region whose power curve is gated behind collectables it never tells you exist.",
      },
    ],
    paragraphs: [
      "The modern open world solved navigation by annotating it: icons, waypoints, a compass full of promises. It works, and it converts exploration into errand-running, because the interesting question — what is over there? — has already been answered by the UI.",
      "Withholding that turns landscape into information. A distant structure is the only prompt available, so players start reading terrain the way the designers composed it: sightlines, silhouettes, and light sources doing the work an icon would.",
      "The cost is real and should not be waved away. Players who bounce off are not failing to appreciate it; they are responding to a genuine accessibility decision. The design buys its best quality by spending something, and pretending otherwise flatters nobody.",
    ],
  },
  {
    category: "gaming",
    title: "Cyberpunk 2077's Redemption Was a Systems Problem",
    type: "article",
    genre: ["Criticism", "Development"],
    year: 2025,
    popularity: 92,
    summary:
      "The recovery is usually told as a bug-fixing story. The changes that actually mattered were to design, and they arrived much later.",
    art: "gaming-cyberpunk-2077.jpg",
    paragraphs: [
      "The launch narrative fixated on crashes and visual faults because those are easy to film. They were real, and they were also the shallowest layer of what was wrong.",
      "The deeper problem was that the systems did not talk to each other. Police appeared from nowhere, perks modified numbers no player could feel, and the city simulated activity rather than consequence. None of that is a bug; all of it is design, and design takes years to revise.",
      "The rehabilitation therefore has a specific lesson. Patching a game to stability restores its reputation for competence; rebuilding its systems restores its reputation for quality. The industry frequently conflates them, and players rarely do.",
    ],
  },
  {
    category: "gaming",
    title: "Baldur's Gate 3 and the Cost of Letting Players Break It",
    type: "article",
    genre: ["Criticism", "Design"],
    year: 2026,
    popularity: 95,
    summary:
      "Permissive design is celebrated and rarely costed. Honouring absurd player solutions requires content nearly nobody will see.",
    art: "gaming-baldurs-gate-3.jpg",
    paragraphs: [
      "The praise is deserved: kill a quest-giver, and the world adapts rather than blocking. That responsiveness is the single most-cited reason the game landed the way it did.",
      "What is less discussed is the production arithmetic. Every honoured alternative is written, voiced and tested for a fraction of players, which means the budget is spent on branches most people will never open. That is an enormous, deliberate inefficiency.",
      "It also constrains what a sequel can be. Having established that the world bends, the next game cannot quietly stop bending — the expectation is now part of the contract, and meeting it does not get cheaper.",
    ],
  },
  {
    category: "gaming",
    title: "Hades Made Failure the Narrative Engine",
    type: "article",
    genre: ["Criticism", "Design"],
    year: 2024,
    popularity: 91,
    summary:
      "Roguelikes had always asked players to die repeatedly. This one made dying the mechanism by which the story advanced.",
    art: "gaming-hades.jpg",
    paragraphs: [
      "The structural problem with a roguelike narrative is that repetition is the format and repetition is death to story. Most solutions decouple the two: a plot that advances on a separate track, indifferent to runs.",
      "Tying dialogue to death instead makes the loop the delivery system. Every failure returns the player to a house full of people with new things to say, so the punishment for losing is more of the thing the player is there for.",
      "It reframes difficulty as pacing. A hard game with this structure is not gating content behind skill; it is metering it, which is a fundamentally kinder shape even when the moment-to-moment challenge is identical.",
    ],
  },
  {
    category: "gaming",
    title: "Sekiro's Posture Bar Rewrote the Formula",
    type: "article",
    genre: ["Craft", "Systems"],
    year: 2025,
    popularity: 90,
    summary:
      "One replaced resource turned an entire combat philosophy inside out. A breakdown of why retreating stopped being an option.",
    art: "gaming-sekiro.jpg",
    paragraphs: [
      "The studio's earlier combat rewarded patience through distance: circle, wait, punish, disengage. Stamina made aggression expensive, so the optimal play was frequently to do nothing.",
      "Replacing health-attrition with posture inverts the incentive. Backing off lets the opponent recover, so disengaging is now the punished action. The same inputs produce an opposite style, purely because of what the bar measures.",
      "It is the clearest demonstration available that combat feel is a resource-design question rather than an animation one. Nothing about the swordplay's timing changed nearly as much as what the numbers were counting.",
    ],
  },
  {
    category: "gaming",
    title: "Persona 5's Soundtrack Is a Character",
    type: "audio",
    genre: ["Review", "Music"],
    year: 2025,
    popularity: 88,
    summary:
      "Acid jazz in a game about teenage insurrection sounds like a mismatch. The score is the one element establishing that the rebellion is stylish rather than desperate.",
    art: "gaming-persona-5.jpg",
    paragraphs: [
      "The genre choice does an enormous amount of tonal work. Acid jazz carries cool and control, which tells the player how to read the heists: as capers rather than as crimes, performed by people enjoying themselves.",
      "It is also functionally clever. Layered arrangements let the same theme thin out for menus and fill in for combat, so the score is continuous across systems that usually feel separate. The music is what makes navigating a menu feel like part of the same evening.",
      "The vocal tracks are the risk. Sung lyrics over gameplay normally exhaust a player within hours, and these survive dozens because the mixes sit back far enough to become texture. That restraint is the least-noticed decision in the whole production.",
    ],
  },
  {
    category: "gaming",
    title: "UI as Attitude",
    type: "image",
    genre: ["Craft", "Interface"],
    year: 2026,
    popularity: 86,
    summary:
      "Menus are usually where a game's personality goes to die. A look at interfaces that refuse to be neutral, and what that costs in usability.",
    art: "gaming-persona-5.jpg",
    paragraphs: [
      "Most interface design optimises for invisibility: get the player to the information and out. That is defensible and it means the majority of games have menus indistinguishable from each other.",
      "The alternative treats the menu as part of the fiction. Angled type, aggressive transitions and animation that costs the player fractions of a second — decisions that are objectively worse by usability metrics and correct by every other measure.",
      "The line is legibility rather than restraint. A loud interface that still answers the player's question instantly is stylish; one that hides the answer is decoration. The distinction is easy to state and evidently difficult to hold.",
    ],
  },

  {
    category: "gaming",
    title: "Watch: Assassin's Creed Brotherhood and the CG-Trailer Era",
    type: "video",
    genre: ["Trailer", "History"],
    year: 2025,
    popularity: 87,
    summary:
      "Three minutes of pre-rendered film with no gameplay in it, closing on a release date. For a few years this was how games were sold, and then it stopped working.",
    art: "video-assassins-creed-brotherhood.jpg",
    media: "assassins-creed-brotherhood-trailer",
    timeline: [
      {
        label: "2007",
        title: "Assassin's Creed ships",
        body: "A new engine, a crowd system nobody had seen, and a marketing campaign that leans on pre-rendered film because the real thing is hard to show in thirty seconds.",
      },
      {
        label: "2009",
        title: "Assassin's Creed II",
        body: "The formula lands. Annual releases become the plan, which means an annual marketing beat has to land too.",
      },
      {
        label: "2010",
        title: "The Brotherhood trailer",
        body: "Three minutes of CG, no gameplay, closing on a date card. The prestige format of its console generation, and this series is one of its most fluent users.",
      },
      {
        label: "2013–2015",
        title: "Trust erodes",
        body: "Reveal footage that does not match the shipped game becomes a running story. Audiences learn to read a CG trailer as a thing being hidden.",
      },
      {
        label: "2018–",
        title: "Gameplay or nothing",
        body: "Showcases lead with captured play and label it. A trailer with no gameplay now reads as an admission rather than as ambition.",
      },
    ],
    paragraphs: [
      "Nothing in this trailer is the game. Ezio moves through a Roman plaza thick with red-robed guards at a fidelity the 2010 hardware could not produce, in a sequence no player will ever be in, rendered by a studio that does not make the game. It ends on a card: November 16th 2010.",
      "The logic was sound at the time. A publisher selling an annualised series needs to communicate tone and scale in a slot where competitors are showing menus and HUDs, and a short pre-rendered film does that better than footage of an early build ever could. For a stretch of that console generation the CG trailer was the prestige format, and this series was one of its most fluent users.",
      "It died because audiences learned to read it. A trailer that shows no gameplay came to signal that there is no gameplay worth showing, and the same viewers who once accepted a CG short as a statement of ambition started treating it as evasion. Watching it now, the craft holds up completely and the persuasion does not — which is a fairly precise description of what changed.",
    ],
  },
  // ────────────────────────────── COSPLAY ──────────────────────────────
  {
    category: "cosplay",
    title: "Building the Haori: The Gradient Problem",
    type: "article",
    genre: ["Build", "Textiles"],
    year: 2026,
    popularity: 90,
    summary:
      "A fade from solid colour to pattern is the single hardest thing to reproduce in fabric, and it is why this build separates careful makers from fast ones.",
    art: "char-shinobu-kocho.png",
    paragraphs: [
      "A printed gradient looks correct in photographs and wrong in person, because the fade sits on the surface rather than in the cloth. Dip-dyeing moves it into the fibre and immediately introduces a new problem: dye migrates while drying, so the transition you set is not the one you get.",
      "The usual compromise is a hybrid — dye the base transition, then airbrush the pattern edge to sharpen where the fade meets the motif. It requires the garment to be constructed after dyeing, which means cutting into fabric you have already spent days on.",
      "Whatever the method, test on offcuts from the same bolt. Fibre content and weave change how dye takes far more than brand does, and a swatch from a different roll will lie to you convincingly.",
    ],
  },
  {
    category: "cosplay",
    title: "Why Zenitsu Is the Best First Build",
    type: "article",
    genre: ["Build", "Beginner"],
    year: 2025,
    popularity: 87,
    summary:
      "A forgiving costume that still photographs well. What a beginner actually learns from it, and where it quietly teaches harder skills.",
    art: "char-zenitsu.png",
    paragraphs: [
      "The reason to recommend it is the ratio of visual payoff to technical demand. A haori, a hakama, a wig and a prop — no armour, no thermoplastics, no closures that have to survive a weekend of movement.",
      "The hidden lesson is the gradient again, at a much lower stake. A yellow fade is more forgiving than a butterfly pattern, so a first attempt teaches the technique without punishing the mistakes, which is exactly what a first build should do.",
      "It also teaches performance, which most beginners skip. The character has two modes and both are legible in a still photograph, so a maker learns quickly that posture and expression carry as much of a convention photo as construction does.",
    ],
  },
  {
    category: "cosplay",
    title: "Foam Armour: Heat, Patience, Sealing",
    type: "article",
    genre: ["Build", "Fabrication"],
    year: 2026,
    popularity: 89,
    summary:
      "Ornate game armour is the most-attempted and most-abandoned category of build. A walkthrough of where attempts actually fail.",
    art: "cosplay-genshin.jpg",
    paragraphs: [
      "Almost every failure is a sealing failure. Foam is porous; paint sinks in, dries patchy, and cracks at every flex point. The fix is unglamorous and non-negotiable — multiple thin sealing passes, fully cured, before any colour goes near it.",
      "Heat-forming is the second wall. Foam has a memory and will return toward flat unless it is heated past the point most beginners are comfortable with and held while it cools. Under-heating produces a piece that slowly unshapes itself over a convention day.",
      "The part nobody photographs is mounting. Armour that looks perfect on a table and shifts while walking reads as a costume rather than a character, and strapping is invariably the thing left until the night before.",
    ],
  },
  {
    category: "cosplay",
    title: "Wig Styling for Gradient Hair",
    type: "article",
    genre: ["Build", "Wigs"],
    year: 2025,
    popularity: 85,
    summary:
      "Anime hair has colour transitions and silhouettes that no human head produces. Both are solvable, and the order you solve them in matters.",
    art: "cosplay-demon-slayer.jpg",
    paragraphs: [
      "Style before colour or colour before style is the argument that never ends, and the answer depends on the transition. A sharp change at a defined point tolerates styling first; a soft fade almost always needs colour laid down while the fibre is still loose.",
      "Silhouette is the harder half. Anime spikes are structural, which means a wig needs internal support — wefts sewn to a wire armature, not product alone. Gel holds a shape that already exists; it will not invent one.",
      "Heat is the constant risk. Most fibre tolerates far less than makers expect, and a single pass with a too-hot iron melts a section unrecoverably. Test on the nape, where a mistake is hidden.",
    ],
  },
  {
    category: "cosplay",
    title: "Convention Floor Photography After Dark",
    type: "image",
    genre: ["Photography", "Guide"],
    year: 2026,
    popularity: 83,
    summary:
      "Convention halls are the worst lighting environment most photographers will work in. Working with that rather than against it.",
    art: "cosplay-jujutsu-kaisen.jpg",
    paragraphs: [
      "The problem is mixed sources: fluorescent overheads, LED booth signage and daylight from an entrance, all at different colour temperatures in one frame. No white balance setting resolves it, which is why so many convention photographs have grey-green skin.",
      "Shooting raw and correcting per-region is the honest fix. The faster one is to overpower the ambient entirely with a single off-camera flash, which costs mobility and buys a consistent, correctable key across the whole day.",
      "Backgrounds are the other half. A hall is visually noisy, so the most useful lens is the longest one you can work in — compression collapses the crowd into texture and leaves the costume as the only thing in focus.",
    ],
  },
  {
    category: "cosplay",
    title: "The Cost of a Screen-Accurate Dress",
    type: "article",
    genre: ["Build", "Textiles"],
    year: 2025,
    popularity: 81,
    summary:
      "Accuracy is not one decision. It is a series of trade-offs between what the reference shows, what fabric can do, and what survives eight hours upright.",
    art: "cosplay-re-zero.jpg",
    paragraphs: [
      "Animation draws cloth that does not obey physics — volumes that hold without support, folds that fall the same way in every shot. Reproducing the silhouette means building understructure the reference never shows, and that structure is most of the work.",
      "Fabric choice is where accuracy and wearability collide. The material that matches on camera is frequently the one that creases in an hour, and the compromise is usually a substitute chosen for how it photographs rather than how it reads in the hand.",
      "The last constraint is the day itself. Anything that cannot be sat down in, carried through a doorway, or repaired in a hotel room with what fits in a bag is a costume for a photoshoot, not for a convention — a legitimate choice, but worth making deliberately.",
    ],
  },
  {
    category: "cosplay",
    title: "Armour as a Fabrication Exam",
    type: "article",
    genre: ["Build", "Fabrication"],
    year: 2026,
    popularity: 84,
    summary:
      "Ornate fantasy plate is where makers find the ceiling of their current skills. A survey of which techniques the hardest builds actually demand.",
    art: "cosplay-fate-stay-night.jpg",
    paragraphs: [
      "The demand is breadth rather than any single difficult skill. One build can require patterning, heat-forming, casting, metallic finishing, weathering and articulated mounting — and a weakness in any one of them shows up in photographs of all the others.",
      "Articulation is the usual failure. A shoulder that looks correct standing still and locks when the arm raises is a patterning problem, solved before fabrication by deciding where the piece is allowed to move.",
      "Finishing separates the good from the excellent. Flat metallic paint reads as plastic; the convincing versions build depth in passes — base, wash, dry-brush, selective polish — and that sequence is closer to model-making than to costuming.",
    ],
  },
];

export const CONTENT_SEED = raw;
