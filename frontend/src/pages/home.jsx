import { useLoaderData } from "react-router";

import { Meta } from "@/components/meta";
import { Hero } from "@/components/home/hero";
import { Ticker } from "@/components/home/ticker";
import { FeatureSpread } from "@/components/home/channel-grid";
import { FeatureSections } from "@/components/home/feature-sections";
import { ChannelWall } from "@/components/home/channel-wall";
import { NowPlaying } from "@/components/home/now-playing";
import { StatsBand } from "@/components/home/stats-band";
import { CharacterRail } from "@/components/home/character-rail";
import { MerchRail } from "@/components/home/merch-rail";
import { EventsStrip } from "@/components/home/events-strip";
import { PullQuote } from "@/components/home/pull-quote";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  const { lead, secondary, rest, total, headlines, extras } = useLoaderData();

  // Issue number is derived from the date, so the masthead reads as a run
  // rather than a static string.
  const now = new Date();
  const issueNumber = `${String(now.getFullYear()).slice(2)}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const feed =
    headlines.length > 0
      ? headlines
      : CATEGORIES.map((c) => `${c.name} — channel open`);

  return (
    <>
      <Meta />
      <ScrollProgress />
      <Hero issueNumber={issueNumber} pieceCount={total} />
      <Ticker items={feed} />
      <FeatureSpread lead={lead} secondary={secondary} rest={rest} />
      {/* The order below is a descent from "read something" to "join in":
          browse by channel, watch, see the scale of it, meet the cast, then
          the shop and the diary before the sign-up. Each section returns
          null on empty data, so a partial database shortens the page rather
          than breaking it. */}
      <ChannelWall />
      <NowPlaying videos={extras.videos} />
      <StatsBand counts={extras.counts} />
      <CharacterRail characters={extras.characters} />
      <PullQuote />
      <MerchRail items={extras.merch} />
      <EventsStrip events={extras.events} />
      <FeatureSections />
    </>
  );
}
