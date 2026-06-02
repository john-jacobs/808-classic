const trip = {
  players: [
    {
      name: "Liam Hession",
      rank: 1,
      score: "E",
      title: "The Social Golfer",
      handicap: "Theoretical",
      arrival: "Thu 7/16, sometime",
      departure: "Staying into the next week",
      headshot: "./assets/optimized/people/headshots/liam-headshot.webp",
      action: "./assets/people/stylized/action/liam-action.jpg",
      bio: "Flying in for the full Seattle residency and eligible for every official function, though early indicators suggest his true priorities are Kevin Crews, Japanese Guy, and any non-golf social programming Seattle can provide.",
      strengths: ["Guest diplomacy", "Extended stay", "Social programming"],
      weakness: "Golf, including the parts before and after contact",
      allegations: "May be more excited about side characters than the founding membership",
    },
    {
      name: "John Jacobs",
      rank: 2,
      score: "+1",
      title: "The Favorite",
      handicap: "Favorite, pending collapse",
      arrival: "Thu 7/16, 8:26 AM · AS 491",
      departure: "Sun 7/19, 8:47 PM",
      headshot: "./assets/optimized/people/headshots/john-headshot.webp",
      action: "./assets/people/stylized/action/john-action.jpg",
      bio: "The odds-on favorite only because Bill is not making the trip. Plays the most, cares too much about etiquette, and has already spent enough time on this website to make everyone uncomfortable.",
      strengths: ["Repetition", "Etiquette enforcement", "Website budget overrun"],
      weakness: "Pressure, consensus, and being wrong quietly",
      allegations: "Will double down on ants, reptiles, rulings, or anything else with insufficient evidence",
    },
    {
      name: "Charles Vokes",
      rank: 3,
      score: "+3",
      title: "The Defending Champion",
      handicap: "Incumbent privilege",
      arrival: "Thu 7/16, noon",
      departure: "Sun 7/19, 10:52 AM",
      headshot: "./assets/optimized/people/headshots/chuck-headshot.webp",
      action: "./assets/people/stylized/action/chuck-action.jpg",
      bio: "The reigning Orange Jacket holder and host of the inaugural Chicago edition. His victory remains legally valid despite a scoring environment best described as ceremonial.",
      strengths: ["Defending champion", "House-host advantage", "Kyle-based instruction"],
      weakness: "Any audit of the 2025 scoring methodology",
      allegations: "Won by hosting, fit, and the absence of a reliable scoring system",
    },
    {
      name: "Jake Dam",
      rank: 4,
      score: "+4",
      title: "The Natural",
      handicap: "Grip-dependent",
      arrival: "Thu 7/16, noonish",
      departure: "Sun 7/19, like 9:30",
      headshot: "./assets/optimized/people/headshots/jakedam-headshot.webp",
      action: "./assets/people/stylized/action/jakedam-action.jpg",
      bio: "Known formally as The Natural, with the quiet confidence of someone who believes every swing issue left over from baseball can be solved by strengthening his grip.",
      strengths: ["Natural aura", "Grip theory", "Baseball damage control"],
      weakness: "Any problem not solved by strengthening his grip",
      allegations: "May diagnose every miss before the ball has stopped moving",
    },
    {
      name: "Arjun Nayini",
      rank: 5,
      score: "+5",
      title: "The Matinee Threat",
      handicap: "Introductory",
      arrival: "TBD",
      departure: "TBD",
      headshot: "./assets/optimized/people/headshots/arjun-headshot.webp",
      action: "./assets/people/stylized/action/arjun-action.jpg",
      bio: "A central IMSA bloc member with limited golf exposure and a Saturday conflict of unusually high cultural legitimacy: The Odyssey, booked months in advance by his wife.",
      strengths: ["Strategic absence", "Cultural programming", "Low expectations"],
      weakness: "Golf knowledge, broadly construed",
      allegations: "May choose Homeric endurance over Saturday match play",
    },
    {
      name: "Evan Rodrigues",
      rank: 6,
      score: "+6",
      title: "The Challenger",
      handicap: "Motivated challenger",
      arrival: "Thu 7/16, 2:30 PM · UA2744",
      departure: "Sun 7/19, 10:29 AM · UA1482",
      headshot: "./assets/optimized/people/headshots/evan-headshot.webp",
      action: "./assets/people/stylized/action/evan-action.jpg",
      bio: "Arrives with flight numbers, competitive intent, and a long memory of being told in college that a natural swing cannot be reverse-engineered in adulthood.",
      strengths: ["Competitive resentment", "Flight numbers", "John rivalry"],
      weakness: "Athleticism, in the same general way as everyone else",
      allegations: "Has been developing a chip on his shoulder since approximately 2011",
    },
    {
      name: "David Weizeorick",
      rank: 7,
      score: "+8",
      title: "The Flight Risk",
      handicap: "Declining asset",
      arrival: "Thu 7/16, likely noon",
      departure: "Sun 7/19, TBD",
      headshot: "./assets/optimized/people/headshots/david-headshot.webp",
      action: "./assets/people/stylized/action/david-action.jpg",
      bio: "Carries nonzero risk of missing the trip entirely, based on a documented history of missed flights and a golf swing that has somehow depreciated over time.",
      strengths: ["Risk tables", "Myrtle Beach precedent", "Narrative volatility"],
      weakness: "Flights, island greens, and year-over-year swing stability",
      allegations: "Once putted off an island green and into a hazard",
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

const leaderboard = document.querySelector("#leaderboard");
const travelRows = document.querySelector("#travelRows");
const lodgingGrid = document.querySelector("#lodgingGrid");
const coursePanel = document.querySelector("#coursePanel");
const eventList = document.querySelector("#eventList");
const attendeeGrid = document.querySelector("#attendeeGrid");
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

function renderLeaderboard() {
  leaderboard.innerHTML = trip.players
    .map(
      (player, index) => `
        <button type="button" data-player="${index}" aria-label="Open dossier for ${player.name}">
          <span class="board-row">
            <img class="board-photo" src="${player.headshot}" alt="" width="42" height="42" decoding="async" />
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
          ${item.image ? `<img class="card-photo" src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" />` : ""}
          <p class="kicker dark">${copyAddressMarkup(item.address)}</p>
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
      <img src="${course.image}" alt="${course.name}" loading="lazy" decoding="async" />
    </div>
    <div class="course-details">
      <p class="kicker dark">${course.day}</p>
      <h3>${course.name}</h3>
      <p class="course-status">${course.status}</p>
      <p class="course-copy">${course.copy}</p>
      <div class="course-links">
        <a href="${course.siteUrl}" target="_blank" rel="noreferrer">Website</a>
        <a href="${course.mapUrl}" target="_blank" rel="noreferrer">Map</a>
        <a href="tel:${course.phone.replace(/[^0-9]/g, "")}">${course.phone}</a>
      </div>
      <div class="course-facts">
        <div><span>Tee times</span><strong>${course.teeTimes}</strong></div>
        <div><span>Address</span><strong>${copyAddressMarkup(course.address)}</strong></div>
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
            <p class="event-meta">
              ${event.time} · ${event.address ? copyAddressMarkup(event.address) : event.place}
            </p>
            <p>${event.copy}</p>
            ${event.link ? `<a class="event-link" href="${event.link}" target="_blank" rel="noreferrer">${event.linkLabel}</a>` : ""}
          </div>
        </article>
      `,
    )
    .join("");
}

function playerCard(player, index) {
  return `
    <article class="attendee-card" data-player="${index}" tabindex="0" role="button" aria-label="Open dossier for ${player.name}">
      <div class="attendee-top">
        <img class="avatar" src="${player.headshot}" alt="${player.name}" width="54" height="54" loading="lazy" decoding="async" />
        <div>
          <h3>${player.name}</h3>
          <span>View dossier</span>
        </div>
      </div>
      <p>${player.bio}</p>
    </article>
  `;
}

function renderAttendees() {
  attendeeGrid.innerHTML = trip.players.map((player, index) => playerCard(player, index)).join("");
}

function renderGuests() {
  guestsGrid.innerHTML = trip.guests
    .map(
      (guest) => `
        <article class="guest-card">
          ${guest.image ? `<img class="guest-photo ${guest.imageFit === "contain" ? "contain" : ""}" src="${guest.image}" alt="${guest.name}" loading="lazy" decoding="async" />` : ""}
          <p class="kicker dark">${guest.role}</p>
          <h3>${guest.name}</h3>
          <p>${guest.detail}</p>
        </article>
      `,
    )
    .join("");
}

function openBio(index) {
  const player = trip.players[index];
  bioDialogContent.innerHTML = `
    <div class="dialog-hero">
      <img class="dialog-action" src="${player.headshot}" alt="${player.name}" width="128" height="128" decoding="async" />
      <div>
        <p class="dialog-title">${player.title}</p>
        <h2>${player.name}</h2>
      </div>
    </div>
    <div class="dialog-body">
      <p>${player.bio}</p>
      <div class="stat-grid">
        <div><span>Handicap</span><strong>${player.handicap}</strong></div>
        <div><span>Weakness</span><strong>${player.weakness}</strong></div>
        <div><span>Allegation</span><strong>${player.allegations}</strong></div>
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

renderLeaderboard();
renderTravel();
renderLodging();
renderCourse();
renderEvents();
renderAttendees();
renderGuests();
updateActiveNav();
