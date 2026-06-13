const CMS_ENDPOINT = "/api/tournament";
const FEED_ENDPOINT = "/api/feed";
const POSTS_ENDPOINT = "/api/posts";
const MEDIA_ENDPOINT = "/api/media";
const SESSION_ENDPOINT = "/api/session";
const CURRENT_CLASSIC_YEAR = "2026";

const fallbackTrip = {
  players: [
    {
      id: "liam-hession",
      name: "Liam Hession",
      rank: 1,
      score: "E",
      title: "The Social Golfer",
      city: "Chicago, IL",
      height: "",
      handicap: 36,
      odds: "+2500",
      classicRecord: "1 appearance",
      quote: "I am mostly here for the broader programming.",
      arrival: "Thu 7/16, sometime",
      departure: "Staying into the next week",
      headshot: "./assets/optimized/people/headshots/liam-headshot.webp",
      action: "./assets/people/stylized/action/liam-action.jpg",
      blurb: "The unofficial Seattle representative for the week, more invested in everyone properly appreciating the city than in the golf itself. He is staying beyond the Classic and, if we are being honest, may be personally more excited to see Kevin Crews and Japanese Guy than the 808 Cali Boys.",
      strength: "Guest diplomacy",
      weakness: "Golf, including the parts before and after contact",
    },
    {
      id: "john-jacobs",
      name: "John Jacobs",
      rank: 2,
      score: "+1",
      title: "The Favorite",
      city: "San Francisco, CA",
      height: "",
      handicap: 10,
      odds: "+225",
      classicRecord: "1 appearance",
      quote: "Actually, I think the rule is...",
      arrival: "Thu 7/16, 8:26 AM · AS 491",
      departure: "Sun 7/19, 8:47 PM",
      headshot: "./assets/optimized/people/headshots/john-headshot.webp",
      action: "./assets/people/stylized/action/john-action.jpg",
      blurb: "The odds-on favorite only because Bill is not making the trip. Plays the most, cares too much about etiquette, and has already spent enough time on this website to make everyone uncomfortable.",
      strength: "Repetition",
      weakness: "Pressure, consensus, and being wrong quietly",
    },
    {
      id: "charles-vokes",
      name: "Charles Vokes",
      rank: 3,
      score: "+3",
      title: "The Defending Champion",
      city: "Chicago, IL",
      height: "",
      handicap: 18,
      odds: "+500",
      classicRecord: "2025 champion",
      quote: "Kyle says...",
      arrival: "Thu 7/16, noon",
      departure: "Sun 7/19, 10:52 AM",
      headshot: "./assets/optimized/people/headshots/chuck-headshot.webp",
      action: "./assets/people/stylized/action/chuck-action.jpg",
      blurb: "The reigning Orange Jacket holder and inaugural Chicago champion. His victory remains legally valid despite a scoring environment best described as ceremonial.",
      strength: "Kyle-based instruction",
      weakness: "Any audit of the 2025 scoring methodology",
    },
    {
      id: "jake-dam",
      name: "Jake Dam",
      rank: 4,
      score: "+4",
      title: "The Natural",
      city: "Chicago, IL",
      height: "",
      handicap: 22,
      odds: "+700",
      classicRecord: "1 appearance",
      quote: "I just need to strengthen my grip.",
      arrival: "Thu 7/16, noonish",
      departure: "Sun 7/19, like 9:30",
      headshot: "./assets/optimized/people/headshots/jakedam-headshot.webp",
      action: "./assets/people/stylized/action/jakedam-action.jpg",
      blurb: "Known formally as The Natural, with the quiet confidence of someone who believes every swing issue left over from baseball can be solved by strengthening his grip.",
      strength: "Natural aura",
      weakness: "Any problem not solved by strengthening his grip",
    },
    {
      id: "arjun-nayini",
      name: "Arjun Nayini",
      rank: 5,
      score: "+5",
      title: "The Matinee Threat",
      city: "Seattle, WA",
      height: "",
      handicap: 40,
      odds: "+4000",
      classicRecord: "1 appearance",
      quote: "I may have a prior commitment.",
      arrival: "TBD",
      departure: "TBD",
      headshot: "./assets/optimized/people/headshots/arjun-headshot.webp",
      action: "./assets/people/stylized/action/arjun-action.jpg",
      blurb: "A central IMSA bloc member with limited golf exposure and a Saturday conflict of unusually high cultural legitimacy: The Odyssey, booked months in advance by his wife.",
      strength: "Strategic absence",
      weakness: "Golf knowledge, broadly construed",
    },
    {
      id: "evan-rodrigues",
      name: "Evan Rodrigues",
      rank: 6,
      score: "+6",
      title: "The Challenger",
      city: "Los Angeles, CA",
      height: "",
      handicap: 20,
      odds: "+650",
      classicRecord: "1 appearance",
      quote: "That swing comment has stayed with me.",
      arrival: "Thu 7/16, 2:30 PM · UA2744",
      departure: "Sun 7/19, 10:29 AM · UA1482",
      headshot: "./assets/optimized/people/headshots/evan-headshot.webp",
      action: "./assets/people/stylized/action/evan-action.jpg",
      blurb: "Arrives with flight numbers, competitive intent, and a long memory of being told in college that a natural swing cannot be reverse-engineered in adulthood.",
      strength: "Competitive resentment",
      weakness: "Athleticism, in the same general way as everyone else",
    },
    {
      id: "david-weizeorick",
      name: "David Weizeorick",
      rank: 7,
      score: "+8",
      title: "The Flight Risk",
      city: "Chicago, IL",
      height: "",
      handicap: 24,
      odds: "+1800",
      classicRecord: "1 appearance",
      quote: "What time is the flight?",
      arrival: "Thu 7/16, likely noon",
      departure: "Sun 7/19, TBD",
      headshot: "./assets/optimized/people/headshots/david-headshot.webp",
      action: "./assets/people/stylized/action/david-action.jpg",
      blurb: "Carries nonzero risk of missing the trip entirely, based on a documented history of missed flights and a golf swing that has somehow depreciated over time.",
      strength: "Narrative volatility",
      weakness: "Flights, island greens, and year-over-year swing stability",
    },
  ],
  alumni: [
    {
      id: "bill-buchdal",
      name: "Bill Buchdal",
      title: "The Missing Favorite",
      city: "",
      handicap: 6,
      classicRecord: "2025 field · not in 2026 field",
      quote: "The odds board looks different when Bill is here.",
      blurb: "A key absence from the Seattle field and the main reason John's favorite status requires an asterisk.",
      headshot: "",
    },
  ],
  siteCopy: [
    {
      key: "about",
      title: "",
      body: "The 808 Classic is the annual reconvening of the 808 Cali Boys: a cross-country effort to get everyone back in the same place, play some golf, and keep the old house alive in a slightly more official form.\n\nThe name traces back to 808 California Ave in Urbana, where the group lived senior year before graduating in 2013. Year two brings the Orange Jacket to Seattle, with Illinois roots, scattered home bases, and just enough ceremony to make a normal golf trip feel questionably official.",
    },
    {
      key: "history",
      title: "History",
      body: "The inaugural 808 Classic was held in the Chicagoland area, with Chuck hosting at Chuck's House and ultimately taking possession of the Orange Jacket. The victory was legitimate in the way all early tournament traditions are legitimate: by consensus, convenience, jacket fit, and the absence of a scoring system that could withstand legal review.\n\nThe 2025 routing included Zigfield Troy, Big Run, The Preserve, a large-field scramble at Ruffled Feathers, and a Sunday round at Belmont in Downers Grove. The photo here is from Belmont, where the tournament briefly resembled an organized sporting event.\n\nSeattle is missing several key members of the extended 808 universe: Hadrien and Arnaud Brisard, Bill Buchdal, Aaron Darroch, Nick Greenway, and the mystery roommate whose legacy remains mostly archival.",
    },
  ],
  lodging: [
    {
      name: "Ravenna Tournament House",
      address: "1206 Northeast 68th Street, Seattle, WA 98115",
      image: "./assets/optimized/airbnb-ravenna-900.webp",
      detail: "Gorgeous 4bd/3ba house with AC, a BBQ grill, and a one-block walk to Roosevelt Light Rail. Official headquarters for sleep math, jacket security, and pretending this trip has a board of directors.",
      links: [
        ["Airbnb", "https://www.airbnb.com/rooms/886590523948778465"],
        ["Google Maps", "https://www.google.com/maps/search/?api=1&query=1206+Northeast+68th+Street%2C+Seattle%2C+WA+98115"],
      ],
      facts: [
        ["Check-in", "Thu Jul 16, 4:00 PM"],
        ["Check-out", "Sun Jul 19, 10:00 AM"],
        ["Beds", "3 kings, 2 bunks, 2 couches"],
        ["Total", "$3,385 for 3 nights"],
        ["Per person", "$483.57 each at 7 guys"],
        ["Transit", "3-minute walk to light rail"],
      ],
    },
  ],
  courses: [
    {
      day: "Thursday",
      name: "Interbay Golf Center",
      status: "Unbooked",
      teeTimes: "Must book July 1st",
      phone: "206-285-2200",
      address: "2501 15th Avenue West, Seattle, WA 98119",
      image: "./assets/optimized/courses/interbay-900.jpg",
      copy: "A practical 9 hole, par 3 course and Top Tracer enabled driving range is a great way for the 808 Cali Bros to warm up after a long day of travel",
      siteUrl: "https://premiergc.com/-interbay-golf-center",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=2501%2015th%20Avenue%20West%2C%20Seattle%2C%20WA%2098119",
    },
    {
      day: "Friday",
      name: "Jackson Park Golf Course",
      status: "Unbooked",
      teeTimes: "Booking opens Thu Jul 2 at 9:00 PM (15 days ahead)",
      phone: "206-363-4747",
      address: "1000 NE 135th Street, Seattle, WA 98125",
      image: "./assets/optimized/courses/jackson-park-900.jpg",
      copy: "A classic Seattle municipal round with tree-lined fairways, enough room for a proper Friday match, and the considerable logistical advantage of staying in the city before the Mariners game.",
      siteUrl: "https://www.premiergc.com/-jackson-park-golf-course",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=1000%20NE%20135th%20Street%2C%20Seattle%2C%20WA%2098125",
    },
    {
      day: "Saturday",
      name: "Gold Mountain Golf Club",
      status: "Unbooked",
      teeTimes: "TBD - coordinate with ferry schedule",
      phone: "360-415-5432",
      address: "7263 W Belfair Valley Rd, Bremerton, WA 98312",
      image: "./assets/optimized/courses/gold-mountain-olympic-1100.webp",
      copy: "The Olympic course is the ferry-day main event: a forested, tournament-tested championship round reached through a fully sanctioned Puget Sound logistical subplot.",
      siteUrl: "https://goldmountaingolf.com/",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=7263%20W%20Belfair%20Valley%20Rd%2C%20Bremerton%2C%20WA%2098312",
    },
  ],
  events: [
    {
      date: "Thu Jul 16",
      title: "Golf at Interbay Golf Center",
      time: "Tee time TBD",
      place: "Interbay Golf Center",
      address: "2501 15th Avenue West, Seattle, WA 98119",
      copy: "Arrival-day warmup on Interbay's nine-hole par-3 course, with the Toptracer range available for anyone who needs immediate evidence that the flight was not the problem.",
      link: "https://www.premiergc.com/-interbay-golf-center",
      linkLabel: "Course website",
    },
    {
      date: "Fri Jul 17",
      title: "Golf at Jackson Park Golf Course",
      time: "Tee time TBD",
      place: "Jackson Park Golf Course",
      address: "1000 NE 135th Street, Seattle, WA 98125",
      copy: "Friday's in-city round before the Mariners game. Booking opens Thursday, July 2 at 9:00 PM, exactly 15 days ahead.",
      link: "https://www.premiergc.com/-jackson-park-golf-course",
      linkLabel: "Course website",
    },
    {
      date: "Fri Jul 17",
      title: "Mariners vs. Giants",
      time: "7:10 PM first pitch",
      place: "T-Mobile Park, Section 192",
      copy: "Officially an evening cultural program. Unofficially Kevin Crews joins the delegation while everyone pretends Section 192 was selected by an analytics department.",
      link: "https://www.mlb.com/mariners/schedule/2026/fullseason",
      linkLabel: "Mariners schedule",
    },
    {
      date: "Sat Jul 18",
      title: "Bainbridge Ferry",
      time: "Departure TBD - coordinate with tee time",
      place: "Seattle Ferry Terminal",
      address: "801 Alaskan Way, Seattle, WA 98104",
      copy: "The Gold Mountain round begins with the full Seattle-to-Bainbridge ferry experience before the drive to Bremerton. Scenic transit is now an official competitive obligation.",
      link: "https://wsdot.com/ferries/schedule/scheduledetailbyroute.aspx?route=sea-bi",
      linkLabel: "Ferry schedule",
    },
    {
      date: "Sat Jul 18",
      title: "Golf at Gold Mountain Golf Club",
      time: "Tee time TBD",
      place: "Gold Mountain Golf Club",
      address: "7263 W Belfair Valley Rd, Bremerton, WA 98312",
      copy: "The championship round on the Olympic course. Ferry timing, drive time, and the tee sheet must be treated as one interconnected operation.",
      link: "https://goldmountaingolf.com/",
      linkLabel: "Course website",
    },
    {
      date: "Sat Jul 18",
      title: "Champions Dinner",
      time: "After golf",
      place: "Seattle, venue TBD",
      copy: "Formal-ish meal where the champion will be treated with respect and give a rousing speech.",
    },
    {
      date: "Sun Jul 19",
      title: "Checkout & Departures",
      time: "10:00 AM checkout",
      place: "Ravenna command center",
      copy: "Final accounting, luggage extraction, airport dispersal, and the quiet dignity of pretending no one is sore.",
    },
  ],
  guests: [
    {
      name: "Kevin Crews",
      role: "Mariners Game Guest",
      image: "./assets/optimized/people/headshots/kevincrews-headshot.webp",
      detail: "High school with Liam, Evan, and Arjun at IMSA; elementary and middle school with John. A rare multi-era credentialed attendee.",
    },
    {
      name: "Japanese Guy",
      role: "Potential Seattle Guest",
      image: "./assets/optimized/people/guests/japanese-man-620.webp",
      imageFit: "contain",
      detail: "Liam met a guy in Japan who is now in Seattle. This is exactly the kind of note an official tournament site should preserve forever.",
    },
    {
      name: "Josh, Kyla, Elora, and TBD",
      role: "Family Contingent",
      image: "./assets/optimized/people/guests/elora-josh-kyla-900.webp",
      detail: "John's brother-in-law Josh and family. Elora is four; another niece will exist by trip time, with naming rights still pending.",
    },
  ],
};

const fallbackWirePosts = [
  {
    type: "dispatch",
    headline: "Chuck Turns Back Arnaud at Macktown, 105-114",
    dek: "A nervous challenger, a microscopic serving of birdie juice, and a back-nine charge settle the first match of the 2026 campaign.",
    byline: "808 Wire Staff",
    location: "Rockton, Illinois",
    published_at: "2026-06-12T15:30:00-05:00",
    body: `Macktown Golf Course once hosted an LPGA Tour event, welcoming winners including Betsy Rawls and Sandra Haynie between 1958 and 1965. On Friday, it provided a similarly historic stage for Charles Vokes and Arnaud Brisard to combine for 219 strokes.

Arnaud arrived nervous for reasons that remain unclear and addressed those nerves by drinking heavily. Chuck arrived sober and running his mouth. The opening stretch nevertheless belonged to Arnaud, who built a four-shot advantage before announcing that Chuck was considerably better. It was an unusually generous scouting report to deliver while leading.

Chuck steadied himself, turned a 55, and then produced the round's decisive stretch on the back nine. His closing 50 beat Arnaud's inward 56 and completed a nine-shot victory, 105 to 114. During the charge, Arnaud reported that Chuck was a monster on the back nine and documented a narrowly missed long birdie putt with the dispatch: "Chuck baggy just missed a long birdie put."

The defending champion's actual birdie activated the agreed-upon Fireball birdie-juice protocol. Chuck, who was not drinking, complied with a sip so small that its competitive and medicinal effects remain under review.

Arnaud spent portions of the round as a self-described head case. Chuck, serving as a golf coach despite ultimately signing for 105, talked him down. By the closing holes, the student had become the public-relations department: "Chuck played insane on the last couple holes. Chuck is a very good golfer."

Chuck offered no reciprocal evaluation of Arnaud. Asked for comment, he first assessed himself: "I need to stop fucking around around the green. Irons weren't great but I figured them out like I did at Lochmere with Jake." Pressed to say something about his opponent, he declined to trash talk and submitted only: "It was beautiful weather on a nice course swinginf a club."`,
    metadata: {
      course: "Macktown Golf Course",
      course_note: "Host of an LPGA Tour event from 1958 through 1965.",
      source_url: "https://en.wikipedia.org/wiki/Cosmopolitan_Open",
      scorecard: [
        { name: "Charles Vokes", front: 55, back: 50, total: 105, to_par: "+34" },
        { name: "Arnaud Brisard", front: 58, back: 56, total: 114, to_par: "+43" },
      ],
    },
    media: [
      { storage_path: "./assets/wire/arnaud-chuck-macktown.webp", sort_order: 0 },
      { storage_path: "./assets/wire/arnaud-chuck-scorecard.webp", sort_order: 1 },
    ],
  },
];

let trip = normalizeTrip(fallbackTrip);
let wirePosts = fallbackWirePosts;
let session = null;

const wireComposerModal = document.querySelector("#wireComposerModal");
const wireComposer = document.querySelector("#wireComposer");
const composerModalClose = document.querySelector("#composerModalClose");
const composerBody = document.querySelector("#composerBody");
const composerFile = document.querySelector("#composerFile");
const composerPreview = document.querySelector("#composerPreview");
const composerSubmit = document.querySelector("#composerSubmit");
const composerError = document.querySelector("#composerError");
const leaderboard = document.querySelector("#leaderboard");
const wireFeed = document.querySelector("#wireFeed");
const wireDate = document.querySelector("#wireDate");
const travelRows = document.querySelector("#travelRows");
const lodgingGrid = document.querySelector("#lodgingGrid");
const courseTabs = document.querySelector(".course-tabs");
const coursePanel = document.querySelector("#coursePanel");
const eventList = document.querySelector("#eventList");
const attendeeGrid = document.querySelector("#attendeeGrid");
const alumniGrid = document.querySelector("#alumniGrid");
const bioDialog = document.querySelector("#bioDialog");
const bioDialogContent = document.querySelector("#bioDialogContent");
const guestsGrid = document.querySelector("#guestsGrid");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const countdownTarget = new Date("2026-07-16T16:00:00-07:00").getTime();
const countdownEls = {
  days: document.querySelector("#countdownDays"),
  hours: document.querySelector("#countdownHours"),
  minutes: document.querySelector("#countdownMinutes"),
  seconds: document.querySelector("#countdownSeconds"),
};
const aboutTitle = document.querySelector("#aboutTitle");
const aboutBody = document.querySelector("#aboutBody");
const historyTitle = document.querySelector("#historyTitle");
const historyCopy = document.querySelector("#historyCopy");

function present(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function truthy(value) {
  if (!present(value)) return true;
  return !["false", "no", "0", "inactive", "hidden"].includes(String(value).trim().toLowerCase());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstPresent(...values) {
  return values.find(present) || "";
}

function normalizePerson(person = {}, attendance = {}) {
  const name = firstPresent(person.name, attendance.name);
  const id = firstPresent(person.id, attendance.person_id, slugify(name));
  const blurb = firstPresent(person.blurb, person.bio, attendance.blurb, attendance.notes);

  return {
    id,
    name,
    title: firstPresent(person.title, attendance.title, "Player"),
    city: firstPresent(person.city, person.location),
    height: firstPresent(person.height),
    handicap: firstPresent(person.handicap, attendance.handicap, "TBD"),
    odds: firstPresent(person.odds, attendance.odds, "TBD"),
    classicRecord: firstPresent(person.classic_record, person.classicRecord, attendance.classic_record),
    quote: firstPresent(person.quote, attendance.quote),
    blurb,
    bio: blurb,
    strength: firstPresent(person.strength, attendance.strength),
    weakness: firstPresent(person.weakness, attendance.weakness),
    rank: firstPresent(attendance.rank, person.rank, ""),
    score: firstPresent(attendance.score, person.score, ""),
    arrival: firstPresent(attendance.arrival, person.arrival, "TBD"),
    departure: firstPresent(attendance.departure, person.departure, "TBD"),
    headshot: firstPresent(person.headshot, person.headshot_url),
    action: firstPresent(person.action_photo, person.action, person.action_url),
    personType: firstPresent(person.person_type, person.personType, attendance.status),
    status: firstPresent(attendance.status, person.status),
    sortOrder: Number(firstPresent(attendance.sort_order, person.sort_order, person.rank, 999)),
  };
}

function normalizeStaticTrip(raw) {
  return {
    ...raw,
    players: (raw.players || []).map((player) => normalizePerson(player, player)).sort((a, b) => a.sortOrder - b.sortOrder),
    alumni: (raw.alumni || []).map((person) => normalizePerson(person, person)).sort((a, b) => a.sortOrder - b.sortOrder),
    siteCopy: raw.siteCopy || raw.site_copy || [],
    lodging: raw.lodging || [],
    courses: raw.courses || [],
    events: raw.events || [],
    guests: raw.guests || [],
  };
}

function normalizeSheetTrip(raw) {
  const people = (raw.people || []).filter((person) => truthy(person.active));
  const attendance = raw.classic_attendance || raw.attendance || [];
  const activeRows = (rows = []) =>
    rows
      .filter((row) => truthy(row.active))
      .sort((a, b) => Number(firstPresent(a.sort_order, 999)) - Number(firstPresent(b.sort_order, 999)));
  const peopleById = new Map(people.map((person) => [firstPresent(person.id, slugify(person.name)), person]));
  const currentRows = attendance.filter((row) => {
    const isCurrentYear = String(firstPresent(row.year, CURRENT_CLASSIC_YEAR)) === CURRENT_CLASSIC_YEAR;
    const status = String(row.status || "").toLowerCase();
    return isCurrentYear && ["player", "current_player", "field"].includes(status) && truthy(row.active);
  });
  const currentIds = new Set(currentRows.map((row) => firstPresent(row.person_id, row.id, slugify(row.name))));
  const priorIds = new Set(
    attendance
      .filter((row) => String(row.year || "") !== CURRENT_CLASSIC_YEAR && ["player", "past_player", "field"].includes(String(row.status || "").toLowerCase()))
      .map((row) => firstPresent(row.person_id, row.id, slugify(row.name))),
  );

  const players = currentRows
    .map((row) => normalizePerson(peopleById.get(firstPresent(row.person_id, row.id, slugify(row.name))), row))
    .filter((person) => person.name)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const alumni = people
    .filter((person) => {
      const id = firstPresent(person.id, slugify(person.name));
      const type = String(firstPresent(person.person_type, person.personType)).toLowerCase();
      return !currentIds.has(id) && (priorIds.has(id) || ["past_player", "alumni"].includes(type));
    })
    .map((person) => normalizePerson(person, attendance.find((row) => firstPresent(row.person_id, row.id, slugify(row.name)) === firstPresent(person.id, slugify(person.name))) || {}))
    .filter((person) => person.name)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const guests = raw.guests
    ? activeRows(raw.guests).map((guest) => ({ ...guest, imageFit: firstPresent(guest.image_fit, guest.imageFit) }))
    : people.filter((person) => ["guest", "family"].includes(String(firstPresent(person.person_type, person.personType)).toLowerCase()));

  return {
    players,
    alumni,
    siteCopy: raw.site_copy ? activeRows(raw.site_copy) : raw.siteCopy || fallbackTrip.siteCopy,
    lodging: raw.lodging ? activeRows(raw.lodging) : fallbackTrip.lodging,
    courses: raw.courses ? activeRows(raw.courses) : fallbackTrip.courses,
    events: raw.events ? activeRows(raw.events) : fallbackTrip.events,
    guests,
  };
}

function normalizeTrip(raw) {
  if (Array.isArray(raw.people)) return normalizeSheetTrip(raw);
  return normalizeStaticTrip(raw);
}

function copyRowsByKey(rows = []) {
  return new Map(rows.filter((row) => present(row.key)).map((row) => [row.key, row]));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

async function loadSession() {
  const response = await fetch(SESSION_ENDPOINT, { cache: "no-store" });
  if (!response.ok) return;
  const data = await response.json();
  session = data.member || null;
}

async function loadCmsTrip() {
  const response = await fetch(CMS_ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error(`CMS request failed: ${response.status}`);
  const data = await response.json();
  trip = normalizeTrip(data);
}

async function loadWire() {
  const response = await fetch(FEED_ENDPOINT, { cache: "no-store" });
  if (!response.ok) throw new Error(`Feed request failed: ${response.status}`);
  const data = await response.json();
  wirePosts = data.posts || [];
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function copyAddressMarkup(address) {
  return `
    <span class="copy-address" role="button" tabindex="0" data-copy="${address}" aria-label="Copy ${address}">
      ${address}
    </span>
  `;
}

function updateCountdown() {
  const remaining = Math.max(0, countdownTarget - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownEls.days.textContent = String(days);
  countdownEls.hours.textContent = String(hours).padStart(2, "0");
  countdownEls.minutes.textContent = String(minutes).padStart(2, "0");
  countdownEls.seconds.textContent = String(seconds).padStart(2, "0");
}

function renderParagraphs(container, body) {
  container.innerHTML = String(body || "")
    .replace(/\\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderSiteCopy() {
  const copy = copyRowsByKey(trip.siteCopy);
  const about = copy.get("about");
  const history = copy.get("history");

  if (about) {
    aboutTitle.textContent = about.title || "";
    aboutTitle.hidden = !present(about.title);
    if (present(about.body)) aboutBody.textContent = about.body.replace(/\\n/g, "\n").replace(/\n+/g, " ");
  }

  if (history) {
    if (present(history.title)) historyTitle.textContent = history.title;
    if (present(history.body)) renderParagraphs(historyCopy, history.body);
  }
}

function formatWireDate(value) {
  if (!present(value)) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function renderFeaturedStory(post) {
  const metadata = post.metadata || {};
  const media = [...(post.media || [])].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  const featureImage = media[0]?.storage_path;
  const scorecardImage = media[1]?.storage_path;
  const scores = metadata.scorecard || [];
  const published = formatWireDate(post.published_at || post.created_at);

  wireDate.textContent = published;

  return `
    <article class="wire-story">
      <header class="wire-story-head">
        <p class="wire-label">${escapeHtml(post.type === "dispatch" ? "Match report" : post.type || "Dispatch")}</p>
        <h3>${escapeHtml(post.headline || "Untitled dispatch")}</h3>
        ${post.dek ? `<p class="wire-dek">${escapeHtml(post.dek)}</p>` : ""}
        <p class="wire-byline">By ${escapeHtml(post.byline || post.author?.display_name || "808 Wire Staff")} · ${escapeHtml(post.location || "")}${post.location && published ? " · " : ""}${escapeHtml(published)}</p>
      </header>

      ${featureImage ? `<img class="wire-feature-image" src="${escapeHtml(featureImage)}" alt="" loading="lazy" decoding="async" />` : ""}

      ${scores.length ? `
        <div class="wire-result" aria-label="Final score">
          <div class="wire-result-title"><span>Final</span><strong>${escapeHtml(metadata.course || "")}</strong></div>
          ${scores.map((score, index) => `
            <div class="wire-score ${index === 0 ? "winner" : ""}">
              <span>${escapeHtml(score.name)}</span>
              <small>Out ${escapeHtml(score.front)} · In ${escapeHtml(score.back)} · ${escapeHtml(score.to_par)}</small>
              <strong>${escapeHtml(score.total)}</strong>
            </div>
          `).join("")}
        </div>` : ""}

      <div class="wire-story-body">
        <div class="wire-copy">
          ${String(post.body || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("")}
        </div>
        <aside class="wire-sidebar">
          ${scorecardImage ? `
            <figure>
              <img src="${escapeHtml(scorecardImage)}" alt="" loading="lazy" decoding="async" />
              <figcaption>Final card · Chuck 105, Arnaud 114</figcaption>
            </figure>` : ""}
          ${metadata.course_note ? `
            <div class="wire-course-note">
              <span>Course notes</span>
              <p>${escapeHtml(metadata.course_note)}</p>
              ${metadata.source_url ? `<a href="${escapeHtml(metadata.source_url)}" target="_blank" rel="noreferrer">Course history</a>` : ""}
            </div>` : ""}
        </aside>
      </div>
    </article>
  `;
}

function renderDispatchItem(post) {
  const published = formatWireDate(post.published_at || post.created_at);
  const byline = post.byline || post.author?.display_name || "808 Wire Staff";
  const media = [...(post.media || [])].sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  const thumb = media[0]?.storage_path;
  const excerpt = String(post.body || "").replace(/\n+/g, " ").trim();

  return `
    <article class="wire-dispatch-item">
      <div>
        <p class="wire-dispatch-meta">${escapeHtml(byline)}${post.location ? ` · ${escapeHtml(post.location)}` : ""}${published ? ` · ${escapeHtml(published)}` : ""}</p>
        ${post.headline ? `<p class="wire-dispatch-meta" style="color:var(--navy);font-size:0.85rem;margin-top:2px">${escapeHtml(post.headline)}</p>` : ""}
        <p class="wire-dispatch-body">${escapeHtml(excerpt)}</p>
      </div>
      ${thumb ? `<img class="wire-dispatch-thumb" src="${escapeHtml(thumb)}" alt="" loading="lazy" decoding="async" />` : ""}
    </article>
  `;
}

function renderDispatches(posts) {
  const postBtnHtml = session
    ? `<button type="button" class="wire-post-btn" id="postToWireBtn">+ Post to Wire</button>`
    : "";

  return `
    <div class="wire-dispatches">
      <div class="wire-dispatches-head">
        <span>Dispatches</span>
        ${postBtnHtml}
      </div>
      ${posts.length
        ? `<div class="wire-dispatch-list">${posts.map(renderDispatchItem).join("")}</div>`
        : `<p class="wire-dispatch-empty">More dispatches will appear here during the trip.</p>`}
    </div>
  `;
}

function renderWire() {
  const featured = wirePosts[0];
  const dispatches = wirePosts.slice(1);

  if (!featured) {
    wireDate.textContent = "Latest dispatch";
    wireFeed.innerHTML = renderDispatches([]);
    return;
  }

  wireFeed.innerHTML = renderFeaturedStory(featured) + renderDispatches(dispatches);
}

function renderLeaderboard() {
  leaderboard.innerHTML = trip.players
    .map(
      (player, index) => `
        <button type="button" data-player="${index}" aria-label="Open dossier for ${player.name}">
          <span class="board-row">
            <img class="board-photo" src="${player.headshot}" alt="" width="42" height="42" decoding="async" />
            <span class="board-rank">${player.rank || index + 1}</span>
            <span class="board-name">${player.name}</span>
            <span class="board-score">${player.score || player.odds || ""}</span>
          </span>
        </button>
      `,
    )
    .join("");
}

function renderTravel() {
  travelRows.innerHTML = trip.players
    .map(
      (player) => `
        <tr>
          <td>
            ${player.name}
          </td>
          <td>${player.arrival}</td>
          <td>${player.departure}</td>
        </tr>
      `,
    )
    .join("");
}

function renderLodging() {
  lodgingGrid.innerHTML = trip.lodging
    .map(
      (item) => {
        const links = item.links || [
          item.airbnb_url ? ["Airbnb", item.airbnb_url] : null,
          item.map_url ? ["Google Maps", item.map_url] : null,
        ].filter(Boolean);
        const facts = item.facts || [
          item.check_in ? ["Check-in", item.check_in] : null,
          item.check_out ? ["Check-out", item.check_out] : null,
          item.beds ? ["Beds", item.beds] : null,
          item.total ? ["Total", item.total] : null,
          item.per_person ? ["Per person", item.per_person] : null,
          item.transit ? ["Transit", item.transit] : null,
        ].filter(Boolean);
        return `
        <article class="lodging-card">
          ${item.image ? `<img class="card-photo" src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />` : ""}
          <p class="kicker dark">${copyAddressMarkup(item.address)}</p>
          <h3>${item.name}</h3>
          <p>${item.detail || item.blurb || ""}</p>
          ${
            links.length
              ? `<div class="lodging-actions">${links
                  .map((link) => `<a href="${link[1]}" target="_blank" rel="noreferrer">${link[0]}</a>`)
                  .join("")}</div>`
              : ""
          }
          <div class="fact-list">
            ${facts.map((fact) => `<div class="fact"><span>${fact[0]}</span><span>${fact[1]}</span></div>`).join("")}
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderCourseTabs(activeIndex = 0) {
  courseTabs.innerHTML = trip.courses
    .map(
      (course, index) => `
        <button class="tab ${index === activeIndex ? "active" : ""}" type="button" data-course="${index}" role="tab" aria-selected="${index === activeIndex ? "true" : "false"}">
          ${course.day || course.name}
        </button>
      `,
    )
    .join("");
}

function renderCourse(index = 0) {
  const course = trip.courses[index];
  if (!course) {
    coursePanel.innerHTML = "";
    return;
  }
  const siteUrl = course.siteUrl || course.site_url || course.website;
  const mapUrl = course.mapUrl || course.map_url;
  const copy = course.copy || course.blurb || course.detail || "";
  const teeTimes = course.teeTimes || course.tee_times || "TBD";
  coursePanel.innerHTML = `
    <div class="course-visual">
      <img src="${course.image}" alt="${course.name}" loading="lazy" decoding="async" />
    </div>
    <div class="course-details">
      <p class="kicker dark">${course.day}</p>
      <h3>${course.name}</h3>
      <p class="course-status">${course.status}</p>
      <p class="course-copy">${copy}</p>
      <div class="course-links">
        ${siteUrl ? `<a href="${siteUrl}" target="_blank" rel="noreferrer">Website</a>` : ""}
        ${mapUrl ? `<a href="${mapUrl}" target="_blank" rel="noreferrer">Map</a>` : ""}
        ${course.phone ? `<a href="tel:${course.phone.replace(/[^0-9]/g, "")}">${course.phone}</a>` : ""}
      </div>
      <div class="course-facts">
        <div><span>Tee times</span><strong>${teeTimes}</strong></div>
        <div><span>Address</span><strong>${copyAddressMarkup(course.address)}</strong></div>
      </div>
    </div>
  `;
}

function renderEvents() {
  const groups = trip.events.reduce((collection, event) => {
    const date = event.date || "TBD";
    if (!collection.has(date)) collection.set(date, []);
    collection.get(date).push(event);
    return collection;
  }, new Map());

  eventList.innerHTML = [...groups.entries()]
    .map(
      ([date, events]) => `
        <section class="event-day" aria-label="${date}">
          <div class="date-chip">${date}</div>
          <div class="event-day-items">
            ${events
              .map((event) => {
                const link = event.link || event.url;
                const linkLabel = event.linkLabel || event.link_label || "Open link";
                const meta = [event.time, event.address ? copyAddressMarkup(event.address) : event.place].filter(Boolean).join(" · ");
                return `
                  <article class="event-item">
                    <h3>${event.title}</h3>
                    ${meta ? `<p class="event-meta">${meta}</p>` : ""}
                    <p>${event.copy || event.detail || event.blurb || ""}</p>
                    ${link ? `<a class="event-link" href="${link}" target="_blank" rel="noreferrer">${linkLabel}</a>` : ""}
                  </article>
                `;
              })
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function playerCard(player, index) {
  return `
    <article class="attendee-card" data-player="${index}" tabindex="0" role="button" aria-label="Open dossier for ${player.name}">
      <div class="attendee-top">
        ${player.headshot ? `<img class="avatar" src="${player.headshot}" alt="${player.name}" width="54" height="54" loading="lazy" decoding="async" />` : `<span class="avatar avatar-fallback">${initials(player.name)}</span>`}
        <div>
          <h3>${player.name}</h3>
          <span>${[player.title, player.city].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
      <div class="player-meta">
        <span>Odds ${player.odds || "TBD"}</span>
        <span>HCP ${player.handicap || "TBD"}</span>
      </div>
      <p>${player.blurb || player.bio}</p>
    </article>
  `;
}

function renderAttendees() {
  attendeeGrid.innerHTML = trip.players.map((player, index) => playerCard(player, index)).join("");
  alumniGrid.innerHTML = (trip.alumni || [])
    .map(
      (person) => `
        <article class="alumni-card">
          ${person.headshot ? `<img class="avatar" src="${person.headshot}" alt="${person.name}" width="44" height="44" loading="lazy" decoding="async" />` : `<span class="avatar avatar-fallback">${initials(person.name)}</span>`}
          <div>
            <h3>${person.name}</h3>
            <p>${[person.title, person.classicRecord].filter(Boolean).join(" · ")}</p>
            ${person.blurb ? `<small>${person.blurb}</small>` : ""}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderGuests() {
  guestsGrid.innerHTML = trip.guests
    .map(
      (guest) => `
        <article class="guest-card">
          ${guest.image ? `<img class="guest-photo ${guest.imageFit === "contain" ? "contain" : ""}" src="${guest.image}" alt="${guest.name}" loading="lazy" decoding="async" />` : ""}
          <p class="kicker dark">${guest.role || guest.person_type || "Guest"}</p>
          <h3>${guest.name}</h3>
          <p>${guest.detail || guest.blurb || guest.bio || ""}</p>
        </article>
      `,
    )
    .join("");
}

function openBio(index) {
  const player = trip.players[index];
  bioDialogContent.innerHTML = `
    <div class="dialog-hero">
      ${player.headshot ? `<img class="dialog-action" src="${player.headshot}" alt="${player.name}" width="128" height="128" decoding="async" />` : `<span class="dialog-action dialog-fallback">${initials(player.name)}</span>`}
      <div>
        <p class="dialog-title">${player.title}</p>
        <h2>${player.name}</h2>
        <p class="dialog-subtitle">${[player.city, player.height ? `${player.height}` : ""].filter(Boolean).join(" · ")}</p>
      </div>
    </div>
    <div class="dialog-body">
      ${player.quote ? `<blockquote>${player.quote}</blockquote>` : ""}
      <p>${player.blurb || player.bio}</p>
      <div class="stat-grid">
        <div><span>Handicap</span><strong>${player.handicap}</strong></div>
        <div><span>Odds</span><strong>${player.odds || "TBD"}</strong></div>
        <div><span>Classic Record</span><strong>${player.classicRecord || "TBD"}</strong></div>
        <div class="stat-trait"><span>Strength</span><strong>${player.strength || "TBD"}</strong></div>
        <div class="stat-trait"><span>Weakness</span><strong>${player.weakness || "TBD"}</strong></div>
      </div>
    </div>
  `;
  bioDialog.showModal();
}

function setActiveNav(sectionId = "") {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
  });
}

function updateActiveNav() {
  const headerOffset = document.querySelector(".topbar").offsetHeight + 12;
  const current = navSections
    .filter((section) => section.getBoundingClientRect().top <= headerOffset)
    .at(-1);
  setActiveNav(current?.id);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

// Composer modal
function openComposerModal() {
  composerClearError();
  wireComposerModal.showModal();
}

function closeComposerModal() {
  wireComposerModal.close();
}

if (wireComposerModal) {
  composerModalClose.addEventListener("click", closeComposerModal);
  // Close on backdrop click
  wireComposerModal.addEventListener("click", (event) => {
    if (event.target === wireComposerModal) closeComposerModal();
  });
}

// Open modal from the dynamically-rendered "Post to Wire" button
wireFeed.addEventListener("click", (event) => {
  if (event.target.closest("#postToWireBtn")) openComposerModal();
});

// Composer form
function composerSetError(message) {
  composerError.textContent = message;
  composerError.hidden = false;
}

function composerClearError() {
  composerError.textContent = "";
  composerError.hidden = true;
}

function composerSetPreview(file) {
  if (!file) {
    composerPreview.hidden = true;
    composerPreview.innerHTML = "";
    return;
  }
  const url = URL.createObjectURL(file);
  const isVideo = file.type.startsWith("video/");
  composerPreview.hidden = false;
  composerPreview.innerHTML = `
    ${isVideo
      ? `<video src="${url}" muted playsinline style="flex-shrink:0;width:48px;height:48px;object-fit:cover;border:1px solid var(--line);border-radius:2px"></video>`
      : `<img src="${url}" alt="Preview" />`}
    <span class="composer-preview-name">${escapeHtml(file.name)}</span>
    <button type="button" class="composer-preview-remove" aria-label="Remove attachment">✕</button>
  `;
}

async function submitPost(body, file) {
  const postResponse = await fetch(POSTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "dispatch", body }),
    cache: "no-store",
  });

  if (!postResponse.ok) {
    const data = await postResponse.json().catch(() => ({}));
    throw new Error(data.error || `Failed to post (${postResponse.status})`);
  }

  const { post } = await postResponse.json();

  if (file && post?.id) {
    const form = new FormData();
    form.append("file", file);
    form.append("postId", post.id);
    const mediaResponse = await fetch(MEDIA_ENDPOINT, { method: "POST", body: form, cache: "no-store" });
    if (!mediaResponse.ok) {
      const data = await mediaResponse.json().catch(() => ({}));
      console.warn("Media upload failed:", data.error || mediaResponse.status);
    }
  }

  return post;
}

if (wireComposer) {
  composerFile.addEventListener("change", () => {
    composerSetPreview(composerFile.files[0] || null);
    composerClearError();
  });

  composerPreview.addEventListener("click", (event) => {
    if (event.target.closest(".composer-preview-remove")) {
      composerFile.value = "";
      composerSetPreview(null);
    }
  });

  wireComposer.addEventListener("submit", async (event) => {
    event.preventDefault();
    composerClearError();

    const body = composerBody.value.trim();
    const file = composerFile.files[0] || null;

    if (!body && !file) {
      composerSetError("Add some text or a photo/video before posting.");
      return;
    }

    composerSubmit.disabled = true;
    composerSubmit.textContent = "Posting…";
    composerBody.disabled = true;

    try {
      await submitPost(body, file);
      composerBody.value = "";
      composerFile.value = "";
      composerSetPreview(null);
      closeComposerModal();
      await loadWire();
      renderWire();
    } catch (error) {
      composerSetError(error.message || "Something went wrong. Try again.");
    } finally {
      composerSubmit.disabled = false;
      composerSubmit.textContent = "Post to Wire";
      composerBody.disabled = false;
    }
  });
}

navLinks.forEach((link) => link.addEventListener("click", () => setActiveNav(link.getAttribute("href").slice(1))));
document.addEventListener("scroll", updateActiveNav, { passive: true });
window.addEventListener("resize", updateActiveNav);

courseTabs.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-selected", "false");
  });
  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  renderCourse(Number(tab.dataset.course));
});

document.body.addEventListener("click", (event) => {
  const copyTarget = event.target.closest("[data-copy]");
  if (copyTarget) {
    copyText(copyTarget.dataset.copy).then(() => {
      copyTarget.classList.add("copied");
      window.setTimeout(() => {
        copyTarget.classList.remove("copied");
      }, 1400);
    });
    return;
  }

  const button = event.target.closest("[data-player]");
  if (!button) return;
  openBio(Number(button.dataset.player));
});

document.body.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const copyTarget = event.target.closest("[data-copy]");
  if (copyTarget) {
    event.preventDefault();
    copyText(copyTarget.dataset.copy).then(() => {
      copyTarget.classList.add("copied");
      window.setTimeout(() => {
        copyTarget.classList.remove("copied");
      }, 1400);
    });
    return;
  }

  const button = event.target.closest("[data-player]");
  if (!button) return;
  event.preventDefault();
  openBio(Number(button.dataset.player));
});

document.querySelector(".dialog-close").addEventListener("click", () => bioDialog.close());

updateCountdown();
setInterval(updateCountdown, 1000);

function renderAll() {
  renderSiteCopy();
  renderWire();
  renderLeaderboard();
  renderTravel();
  renderLodging();
  renderCourseTabs();
  renderCourse();
  renderEvents();
  renderAttendees();
  renderGuests();
  updateActiveNav();
}

async function init() {
  const [cmsResult, wireResult, sessionResult] = await Promise.allSettled([
    loadCmsTrip(),
    loadWire(),
    loadSession(),
  ]);

  if (cmsResult.status === "rejected") {
    console.warn("Using fallback trip data because CMS loading failed.", cmsResult.reason);
    trip = normalizeTrip(fallbackTrip);
  }

  if (wireResult.status === "rejected") {
    console.warn("The 808 Wire could not be loaded.", wireResult.reason);
    wirePosts = fallbackWirePosts;
  }

  if (sessionResult.status === "rejected") {
    console.warn("Session could not be loaded.", sessionResult.reason);
  }

  // session drives whether the "Post to Wire" button renders (handled in renderWire)

  renderAll();
}

init();
