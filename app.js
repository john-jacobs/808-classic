const trip = {
  players: [
    {
      name: "Liam Hession",
      rank: 1,
      score: "E",
      title: "International Liaison",
      handicap: "Customs pending",
      arrival: "Thu 7/16, sometime",
      departure: "Staying into the next week",
      profile: "https://www.linkedin.com/in/liam-hession-22178817/",
      headshot: "./assets/people/stylized/headshots/liam-headshot.jpg",
      action: "./assets/people/stylized/action/liam-action.jpg",
      bio: "Flying in for the full Seattle residency and therefore eligible for both the Orange Jacket and excessive local recommendations. Has the rare scheduling confidence of someone not leaving Sunday night.",
      strengths: ["Extended stay", "IMSA caucus", "Local diplomacy"],
      weakness: "A departure date with legal clarity",
      allegations: "May introduce an unnamed Seattle contact from Japan",
    },
    {
      name: "John Jacobs",
      rank: 2,
      score: "+1",
      title: "Tournament Founder",
      handicap: "Invented annually",
      arrival: "Thu 7/16, 8:26 AM · AS 491",
      departure: "Sun 7/19, 8:47 PM",
      profile: "https://www.linkedin.com/in/johnrjacobs1",
      headshot: "./assets/people/stylized/headshots/john-headshot.jpg",
      action: "./assets/people/stylized/action/john-action.jpg",
      bio: "Commissioner, webmaster, and likely author of several favorable interpretations of local rules. Arrives early enough to claim this was all operationally necessary.",
      strengths: ["Logistics", "Receipts", "Ceremony"],
      weakness: "Any shot witnessed by peers",
      allegations: "Spent time building this",
    },
    {
      name: "Charles Vokes",
      rank: 3,
      score: "+3",
      title: "Noon Arrival Committee",
      handicap: "Chuck-adjusted",
      arrival: "Thu 7/16, noon",
      departure: "Sun 7/19, 10:52 AM",
      profile: "https://www.linkedin.com/in/charles-vokes-914a8168/",
      headshot: "./assets/people/stylized/headshots/chuck-headshot.jpg",
      action: "./assets/people/stylized/action/chuck-action.jpg",
      bio: "Listed formally as Charles Vokes and operationally as Chuck, which is exactly the type of ambiguity this tournament deserves. Sunday departure is early enough to avoid several rulings.",
      strengths: ["Concise schedule", "Alias management", "Morning exits"],
      weakness: "Full-name bureaucracy",
      allegations: "Could leave before the jacket speech gets weird",
    },
    {
      name: "Jake Dam",
      rank: 4,
      score: "+4",
      title: "Noonish Operations",
      handicap: "Noonish",
      arrival: "Thu 7/16, noonish",
      departure: "Sun 7/19, like 9:30",
      profile: "https://www.linkedin.com/in/jake-dam-0741a08b/",
      headshot: "./assets/people/stylized/headshots/jakedam-headshot.jpg",
      action: "./assets/people/stylized/action/jakedam-action.jpg",
      bio: "The official keeper of approximate time. His logistics language contains enough softness to survive travel delays, tee sheets, and brunch negotiations.",
      strengths: ["Flex windows", "Casual precision", "Group chat ambiguity"],
      weakness: "Specific clocks",
      allegations: "Filed all times in vibes, not minutes",
    },
    {
      name: "Arjun Nayini",
      rank: 5,
      score: "+5",
      title: "TBD Desk",
      handicap: "Pending audit",
      arrival: "TBD",
      departure: "TBD",
      profile: "https://www.linkedin.com/in/arjun-nayini-2b677117/",
      headshot: "./assets/people/stylized/headshots/arjun-headshot.jpg",
      action: "./assets/people/stylized/action/arjun-action.jpg",
      bio: "A central member of the IMSA bloc whose travel details remain classified. The committee respects this strategic opacity and fears what it may imply for match play.",
      strengths: ["Mystery", "IMSA caucus", "Late-breaking leverage"],
      weakness: "Published flight data",
      allegations: "May be waiting for the optimal reveal",
    },
    {
      name: "Evan Rodrigues",
      rank: 6,
      score: "+6",
      title: "United Desk",
      handicap: "UA confirmed",
      arrival: "Thu 7/16, 2:30 PM · UA2744",
      departure: "Sun 7/19, 10:29 AM · UA1482",
      profile: "https://www.linkedin.com/in/eprodrig",
      headshot: "./assets/people/stylized/headshots/evan-headshot.jpg",
      action: "./assets/people/stylized/action/evan-action.jpg",
      bio: "Arrives with actual flight numbers, a powerful act of maturity that will be remembered when the rest of the field says things like noonish.",
      strengths: ["Documentation", "IMSA caucus", "Flight numbers"],
      weakness: "Sunday morning escape routes",
      allegations: "Submitted paperwork too competently",
    },
    {
      name: "David Weizeorick",
      rank: 7,
      score: "+8",
      title: "Actuarial Risk Office",
      handicap: "Modeled, not disclosed",
      arrival: "Thu 7/16, likely noon",
      departure: "Sun 7/19, TBD",
      profile: "https://www.linkedin.com/in/david-weizeorick-asa-maaa-b9701218a",
      headshot: "./assets/people/stylized/headshots/david-headshot.jpg",
      action: "./assets/people/stylized/action/david-action.jpg",
      bio: "The committee believes David is likely arriving around noon, which is a sentence with both confidence and plausible deniability. Expected to price the risk of every side bet.",
      strengths: ["Risk tables", "Noon probability", "Quiet menace"],
      weakness: "A fully settled Sunday plan",
      allegations: "May calculate everyone's true handicap",
    },
  ],
  lodging: [
    {
      name: "Ravenna Tournament House",
      address: "1206 Northeast 68th Street, Seattle, WA 98115",
      image: "./assets/airbnb-ravenna.jpg",
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
      round: "Likely Thursday",
      name: "Mount Si Golf Course",
      date: "Eastside board",
      tee: "$85 greens fees",
      image: "./assets/course-mount-si.jpg",
      copy: "Best Thursday option according to the committee. Will let the group prebook, rents clubs for $30, and has therefore achieved frontrunner status.",
      url: "https://mtsigolf.com/home/",
      pairings: [
        ["Status", "Prebook friendly"],
        ["Rental clubs", "$30"],
        ["Committee note", "Best Thursday option IMO"],
      ],
    },
    {
      round: "Ferry Day",
      name: "Gold Mountain Golf Club",
      date: "Bremerton",
      tee: "Book 28 days ahead",
      image: "./assets/course-gold-mountain.jpg",
      copy: "Premier ferry-day candidate. Current instruction is to call John Sitton and book 28 days ahead if there is not a prior callback.",
      url: "https://goldmountaingolf.com/",
      pairings: [
        ["Primary option", "Gold Mountain"],
        ["Alternates", "Meadowmeer, Vashon, Whidbey, Port Townsend"],
        ["Operational risk", "Ferry timing plus group confidence"],
      ],
    },
    {
      round: "Splurge Round",
      name: "Salish Cliffs / Newcastle",
      date: "Friday or Saturday",
      tee: "$100-$150 target",
      image: "./assets/course-salish.jpg",
      copy: "The premium board is live. Salish Cliffs will prebook Friday or Saturday with no deposit; Newcastle can work on the 18th but may require a contract.",
      url: "https://salishcliffs.com/rates/",
      pairings: [
        ["Salish Cliffs", "Ask for Jeff"],
        ["Newcastle", "Ryan · 425 646 6960"],
        ["Other options", "Gold Mountain Olympic, Washington National, The Home Course"],
      ],
    },
    {
      round: "Backup Board",
      name: "Eastside & Public Queue",
      date: "Research docket",
      tee: "Variable",
      image: "./assets/course-newcastle.jpg",
      copy: "Redmond Ridge has a tournament, Snoqualmie requires normal public booking, Maplewood's phones are in witness protection, and Druids Glen may call back.",
      url: "https://redmondridgegolf.com/",
      pairings: [
        ["Redmond Ridge", "Tournament weekend"],
        ["Snoqualmie Falls", "Book 6 days out"],
        ["Druids Glen", "Message left"],
      ],
    },
  ],
  events: [
    {
      date: "Thu Jul 16",
      title: "Arrivals & Ravenna Check-In",
      time: "4:00 PM check-in",
      place: "1206 Northeast 68th Street",
      status: "Housing secured",
      copy: "Flights land in waves, the house opens, and the committee begins the delicate audit of clubs, bags, rides, and who has already overpacked.",
      link: "https://www.google.com/maps/search/?api=1&query=1206%20Northeast%2068th%20Street%2C%20Seattle%2C%20WA%2098115",
      linkLabel: "Open house map",
    },
    {
      date: "Fri Jul 17",
      title: "Mariners vs. Giants",
      time: "7:10 PM first pitch",
      place: "T-Mobile Park, Section 192",
      status: "Baseball adjunct",
      copy: "Officially an evening cultural program. Unofficially Kevin Crews joins the delegation while everyone pretends Section 192 was selected by an analytics department.",
      link: "https://www.mlb.com/mariners/schedule/2026/fullseason",
      linkLabel: "Mariners schedule",
    },
    {
      date: "Sat Jul 18",
      title: "Moving Day & Champions Dinner",
      time: "After golf",
      place: "Seattle, venue TBD",
      status: "Mandatory",
      copy: "Formal-ish meal where the leader will be treated with respect for roughly six minutes before rulings, allegations, and swing diagnoses resume.",
    },
    {
      date: "Sun Jul 19",
      title: "Checkout & Departures",
      time: "10:00 AM checkout",
      place: "Ravenna command center",
      status: "Closing ceremony",
      copy: "Final accounting, luggage extraction, airport dispersal, and the quiet dignity of pretending no one is sore.",
    },
  ],
  guests: [
    {
      name: "Kevin Crews",
      role: "Mariners Game Guest",
      image: "./assets/people/stylized/headshots/kevincrews-headshot.jpg",
      detail: "High school with Liam, Evan, and Arjun at IMSA; elementary and middle school with John. A rare multi-era credentialed attendee.",
    },
    {
      name: "Japanese Guy",
      role: "Potential Seattle Cameo",
      image: "./assets/people/japanese man.png",
      imageFit: "contain",
      detail: "Liam met a guy in Japan who is now in Seattle. This is exactly the kind of note an official tournament site should preserve forever.",
    },
    {
      name: "Josh, Kyla, Elora, and TBD",
      role: "Family Contingent",
      image: "./assets/people/stylized/action/elora-josh-kyla-action.jpg",
      detail: "John's wife's brother Josh and family. Elora is four; another niece will exist by trip time, with naming rights still pending.",
    },
  ],
  outdoors: [
    {
      name: "Discovery Park",
      status: "Top contender",
      detail: "Great, easily accessible, and roughly 22 minutes away. Offers Puget Sound views, meadows, beaches, forest, and enough wholesomeness to offset one round of pace-of-play arguments.",
    },
    {
      name: "Vashon Island",
      status: "More work, more wild",
      detail: "A full island-side quest with charming dining options and lighthouse/beach energy. High upside, higher logistics friction.",
    },
  ],
};

const leaderboard = document.querySelector("#leaderboard");
const travelRows = document.querySelector("#travelRows");
const lodgingGrid = document.querySelector("#lodgingGrid");
const coursePanel = document.querySelector("#coursePanel");
const eventList = document.querySelector("#eventList");
const attendeeGrid = document.querySelector("#attendeeGrid");
const bioDialog = document.querySelector("#bioDialog");
const bioDialogContent = document.querySelector("#bioDialogContent");
const playerSearch = document.querySelector("#playerSearch");
const guestsGrid = document.querySelector("#guestsGrid");
const outdoorsGrid = document.querySelector("#outdoorsGrid");

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderLeaderboard() {
  leaderboard.innerHTML = trip.players
    .map(
      (player, index) => `
        <button type="button" data-player="${index}" aria-label="Open dossier for ${player.name}">
          <span class="board-row">
            <img class="board-photo" src="${player.headshot}" alt="" />
            <span class="board-rank">${player.rank}</span>
            <span class="board-name">${player.name}</span>
            <span class="board-score">${player.score}</span>
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
          <td>${player.allegations}</td>
        </tr>
      `,
    )
    .join("");
}

function renderLodging() {
  lodgingGrid.innerHTML = trip.lodging
    .map(
      (item) => `
        <article class="lodging-card">
          ${item.image ? `<img class="card-photo" src="${item.image}" alt="${item.name}" />` : ""}
          <p class="kicker dark">${item.address}</p>
          <h3>${item.name}</h3>
          <p>${item.detail}</p>
          ${
            item.links
              ? `<div class="lodging-actions">${item.links
                  .map((link) => `<a href="${link[1]}" target="_blank" rel="noreferrer">${link[0]}</a>`)
                  .join("")}</div>`
              : ""
          }
          <div class="fact-list">
            ${item.facts.map((fact) => `<div class="fact"><span>${fact[0]}</span><span>${fact[1]}</span></div>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCourse(index = 0) {
  const course = trip.courses[index];
  coursePanel.innerHTML = `
    <div class="course-visual">
      <img src="${course.image}" alt="${course.name}" />
    </div>
    <div class="course-details">
      <p class="kicker dark">${course.round} · ${course.date} · ${course.tee}</p>
      <h3>${course.name}</h3>
      <p class="course-copy">${course.copy}</p>
      <a class="course-link" href="${course.url}" target="_blank" rel="noreferrer">Open course site</a>
      <div class="pairings">
        ${course.pairings.map((pairing) => `<div class="pairing"><span>${pairing[0]}</span><span>${pairing[1]}</span></div>`).join("")}
      </div>
    </div>
  `;
}

function renderEvents() {
  eventList.innerHTML = trip.events
    .map(
      (event) => `
        <article class="event-item">
          <div class="date-chip">${event.date}</div>
          <div>
            <h3>${event.title}</h3>
            <p class="event-meta">${event.time} · ${event.place}</p>
            <p>${event.copy}</p>
            ${event.link ? `<a class="event-link" href="${event.link}" target="_blank" rel="noreferrer">${event.linkLabel}</a>` : ""}
          </div>
          <span class="status">${event.status}</span>
        </article>
      `,
    )
    .join("");
}

function playerCard(player, index) {
  return `
    <article class="attendee-card">
      <div class="attendee-top">
        <img class="avatar" src="${player.headshot}" alt="${player.name}" />
        <div>
          <h3>${player.name}</h3>
        </div>
      </div>
      <p>${player.bio}</p>
      <div class="traits">
        ${player.strengths.map((trait) => `<span>${trait}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="bio-button" type="button" data-player="${index}">Open Official Dossier</button>
        <a class="profile-link" href="${player.profile}" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </article>
  `;
}

function renderAttendees(query = "") {
  const normalized = query.trim().toLowerCase();
  const filtered = trip.players.filter((player) => {
    const searchable = [player.name, player.title, player.handicap, player.bio, player.weakness, player.allegations, ...player.strengths]
      .join(" ")
      .toLowerCase();
    return searchable.includes(normalized);
  });
  attendeeGrid.innerHTML = filtered.map((player) => playerCard(player, trip.players.indexOf(player))).join("");
}

function renderGuests() {
  guestsGrid.innerHTML = trip.guests
    .map(
      (guest) => `
        <article class="guest-card">
          ${guest.image ? `<img class="guest-photo ${guest.imageFit === "contain" ? "contain" : ""}" src="${guest.image}" alt="${guest.name}" />` : ""}
          <p class="kicker dark">${guest.role}</p>
          <h3>${guest.name}</h3>
          <p>${guest.detail}</p>
        </article>
      `,
    )
    .join("");
}

function renderOutdoors() {
  outdoorsGrid.innerHTML = trip.outdoors
    .map(
      (item) => `
        <article class="guest-card">
          <p class="kicker dark">${item.status}</p>
          <h3>${item.name}</h3>
          <p>${item.detail}</p>
        </article>
      `,
    )
    .join("");
}

function openBio(index) {
  const player = trip.players[index];
  bioDialogContent.innerHTML = `
    <div class="dialog-hero">
      <img class="dialog-action" src="${player.headshot}" alt="${player.name}" />
      <h2>${player.name}</h2>
    </div>
    <div class="dialog-body">
      <p>${player.bio}</p>
      <a class="dialog-profile" href="${player.profile}" target="_blank" rel="noreferrer">Open LinkedIn profile</a>
      <div class="stat-grid">
        <div><span>Handicap</span><strong>${player.handicap}</strong></div>
        <div><span>Weakness</span><strong>${player.weakness}</strong></div>
        <div><span>Allegation</span><strong>${player.allegations}</strong></div>
      </div>
    </div>
  `;
  bioDialog.showModal();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    renderCourse(Number(tab.dataset.course));
  });
});

document.body.addEventListener("click", (event) => {
  const button = event.target.closest("[data-player]");
  if (!button) return;
  openBio(Number(button.dataset.player));
});

document.querySelector(".dialog-close").addEventListener("click", () => bioDialog.close());
playerSearch.addEventListener("input", (event) => renderAttendees(event.target.value));

renderLeaderboard();
renderTravel();
renderLodging();
renderCourse();
renderEvents();
renderAttendees();
renderGuests();
renderOutdoors();
