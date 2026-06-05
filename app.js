const CMS_ENDPOINT = "";
const GOOGLE_SHEET_ID = "1AKufVeZHkFDZlqPAKimku8onQ43nApdpKlxKCuEv84Q";
const GOOGLE_SHEET_TABS = ["people", "classic_attendance", "site_copy", "lodging", "courses", "events", "guests"];
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
      blurb: "Flying in for the full Seattle residency and eligible for every official function, though early indicators suggest his true priorities are Kevin Crews, Japanese Guy, and any non-golf social programming Seattle can provide.",
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
      title: "Second Annual. First Real Attempt at Legitimacy.",
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
      name: "Mount Si Golf Course",
      status: "Unbooked",
      teeTimes: "TBD",
      phone: "425-391-4926",
      address: "9010 Boalch Ave SE, Snoqualmie, WA 98065",
      image: "./assets/optimized/courses/mount-si-900.webp",
      copy: "A practical opening round in Snoqualmie with mountain views, rental clubs, and enough scenery to briefly disguise the quality of play.",
      siteUrl: "https://www.mtsigolf.com/",
      teeUrl: "https://www.mtsigolf.com/tee-times/",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=9010%20Boalch%20Ave%20SE%2C%20Snoqualmie%2C%20WA%2098065",
    },
    {
      day: "Friday",
      name: "Gold Mountain Golf Club",
      status: "Unbooked",
      teeTimes: "TBD",
      phone: "360-415-5432",
      address: "7263 W Belfair Valley Rd, Bremerton, WA 98312",
      image: "./assets/optimized/courses/gold-mountain-olympic-1100.webp",
      copy: "The Olympic course is the ferry-day main event: forested, tournament-tested, and dramatic enough to justify a full logistical subplot.",
      siteUrl: "https://goldmountaingolf.com/",
      teeUrl: "https://www.chronogolf.com/en/club/14711/widget?medium=widget&source=club",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=7263%20W%20Belfair%20Valley%20Rd%2C%20Bremerton%2C%20WA%2098312",
    },
    {
      day: "Saturday",
      name: "Salish Cliffs Golf Club",
      status: "Unbooked",
      teeTimes: "TBD",
      phone: "360-462-3673",
      address: "91 W State Route 108, Shelton, WA 98584",
      image: "./assets/optimized/courses/salish-900.webp",
      copy: "A proper final-round venue near Shelton with secluded PNW views, GPS carts, a big practice setup, and enough elevation change to expose every lie about conditioning.",
      siteUrl: "https://salishcliffs.com/",
      teeUrl: "https://book.rguest.com/onecart/golf/courses/1937/LittleCreekCasinoResort",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=91%20W%20State%20Route%20108%2C%20Shelton%2C%20WA%2098584",
    },
  ],
  events: [
    {
      date: "Thu Jul 16",
      title: "Arrivals & Ravenna Check-In",
      time: "4:00 PM check-in",
      place: "1206 Northeast 68th Street",
      address: "1206 Northeast 68th Street, Seattle, WA 98115",
      copy: "Flights land in waves, the house opens, and the committee begins the delicate audit of clubs, bags, rides, and who has already overpacked.",
      link: "https://www.google.com/maps/search/?api=1&query=1206%20Northeast%2068th%20Street%2C%20Seattle%2C%20WA%2098115",
      linkLabel: "Open house map",
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
      title: "Moving Day & Champions Dinner",
      time: "After golf",
      place: "Seattle, venue TBD",
      copy: "Formal-ish meal where the leader will be treated with respect for roughly six minutes before rulings, allegations, and swing diagnoses resume.",
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

let trip = normalizeTrip(fallbackTrip);

const leaderboard = document.querySelector("#leaderboard");
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

function keyify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
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
    handicap: firstPresent(attendance.handicap, person.handicap, "TBD"),
    odds: firstPresent(attendance.odds, person.odds, "TBD"),
    classicRecord: firstPresent(attendance.classic_record, person.classic_record, person.classicRecord),
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

async function loadCmsTrip() {
  let data;

  if (CMS_ENDPOINT) {
    const response = await fetch(CMS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error(`CMS request failed: ${response.status}`);
    data = await response.json();
  } else if (GOOGLE_SHEET_ID) {
    data = await loadGoogleSheetData();
  } else {
    return;
  }

  trip = normalizeTrip(data);
}

function loadGoogleSheetTab(tabName) {
  return new Promise((resolve, reject) => {
    const callbackName = `__cms_${tabName}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const url = new URL(`https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq`);
    const timeout = window.setTimeout(() => {
      delete window[callbackName];
      script.remove();
      reject(new Error(`Timed out loading ${tabName}`));
    }, 6000);

    url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
    url.searchParams.set("sheet", tabName);

    window[callbackName] = (response) => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();

      if (response.status === "error") {
        reject(new Error(response.errors?.[0]?.detailed_message || `Unable to load ${tabName}`));
        return;
      }

      const columns = response.table.cols.map((column) => keyify(column.label || column.id));
      const rows = response.table.rows.map((row) =>
        columns.reduce((record, key, index) => {
          record[key] = row.c[index]?.f ?? row.c[index]?.v ?? "";
          return record;
        }, {}),
      );

      resolve(rows.filter((row) => Object.values(row).some(present)));
    };

    script.onerror = () => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
      reject(new Error(`Unable to load ${tabName}`));
    };

    script.src = url.toString();
    document.head.appendChild(script);
  });
}

async function loadGoogleSheetData() {
  const entries = await Promise.all(GOOGLE_SHEET_TABS.map(async (tab) => [tab, await loadGoogleSheetTab(tab)]));
  return Object.fromEntries(entries);
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
    if (present(about.title)) aboutTitle.textContent = about.title;
    if (present(about.body)) aboutBody.textContent = about.body.replace(/\\n/g, "\n").replace(/\n+/g, " ");
  }

  if (history) {
    if (present(history.title)) historyTitle.textContent = history.title;
    if (present(history.body)) renderParagraphs(historyCopy, history.body);
  }
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
  eventList.innerHTML = trip.events
    .map(
      (event) => {
        const link = event.link || event.url;
        const linkLabel = event.linkLabel || event.link_label || "Open link";
        return `
        <article class="event-item">
          <div class="date-chip">${event.date}</div>
          <div>
            <h3>${event.title}</h3>
            <p class="event-meta">
              ${event.time} · ${event.address ? copyAddressMarkup(event.address) : event.place}
            </p>
            <p>${event.copy || event.detail || event.blurb || ""}</p>
            ${link ? `<a class="event-link" href="${link}" target="_blank" rel="noreferrer">${linkLabel}</a>` : ""}
          </div>
        </article>
      `;
      },
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
  try {
    await loadCmsTrip();
  } catch (error) {
    console.warn("Using fallback trip data because CMS loading failed.", error);
    trip = normalizeTrip(fallbackTrip);
  }

  renderAll();
}

init();
