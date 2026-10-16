/*
  NEW DESTINY FOOTBALL TOURNAMENT
  ===============================
  TO UPDATE RESULTS:
  1. Edit the MATCH_RESULTS object below.
  2. Save script.js and upload/commit it to your website.
  3. The league tables and knockout teams calculate automatically.

  Example:
    G1: { home: 2, away: 1 }  means Group A Match 1 finished 2–1.
  Leave a match commented out or set it to null until it is played.
*/

const TEAMS = [
  { id: "A1", name: "Team A", group: "A" },
  { id: "A2", name: "Team B", group: "A" },
  { id: "A3", name: "Team C", group: "A" },
  { id: "B1", name: "Team D", group: "B" },
  { id: "B2", name: "Team E", group: "B" },
  { id: "B3", name: "Team F", group: "B" }
];

/*
  ADD MATCH SCORES HERE.
  Use whole numbers only. Do not enter a tied score for a semi-final or final;
  enter the score after extra time / penalties so there is a winner.
*/
const MATCH_RESULTS = {
  // FRIDAY — GROUP STAGE (each team plays two matches)
  G1: null, // Group A: Team A1 vs Team A2, e.g. { home: 2, away: 1 }
  G2: null, // Group A: Team A2 vs Team A3
  G3: null, // Group A: Team A3 vs Team A1
  G4: null, // Group B: Team B1 vs Team B2
  G5: null, // Group B: Team B2 vs Team B3
  G6:  { home: 1, away: 0 }, // Group B: Team B3 vs Team B1

  // SATURDAY — KNOCKOUT STAGE
  SF1: null, // Group A 1st vs Group B 2nd
  SF2: null, // Group B 1st vs Group A 2nd
  F: null    // Semi-final 1 winner vs Semi-final 2 winner
};

const MATCHES = [
  {id:"G1",day:"Friday",round:"Group I · Match 1",group:"A",home:"A1",away:"A2",time:"7:00 to 8:00 AM"},
  {id:"G2",day:"Friday",round:"Group I · Match 2",group:"A",home:"A2",away:"A3",time:"9:00 to 10:00 AM"},
  {id:"G3",day:"Friday",round:"Group I · Match 3",group:"A",home:"A3",away:"A1",time:"3:00 to 4:00 PM"},
  {id:"G4",day:"Friday",round:"Group II · Match 1",group:"B",home:"B1",away:"B2",time:"8:00 to 9:00 AM"},
  {id:"G5",day:"Friday",round:"Group II · Match 2",group:"B",home:"B2",away:"B3",time:"4:00 to 5:00 PM"},
  {id:"G6",day:"Friday",round:"Group II · Match 3",group:"B",home:"B3",away:"B1",time:"2:00 to 3:00 PM"},
  {id:"SF1",day:"Saturday",round:"Semi-final 1",home:"A1",away:"B2",knockout:true,time:"Time to be announced"},
  {id:"SF2",day:"Saturday",round:"Semi-final 2",home:"B1",away:"A2",knockout:true,time:"Time to be announced"},
  {id:"F",day:"Saturday",round:"Grand Final",home:"SF1W",away:"SF2W",knockout:true,time:"Time to be announced"}
];

const $ = id => document.getElementById(id);
const teamById = id => TEAMS.find(t => t.id === id);
const teamName = id => teamById(id)?.name || id;
const result = id => {
  const r = MATCH_RESULTS[id];
  if (!r || !Number.isInteger(r.home) || !Number.isInteger(r.away) || r.home < 0 || r.away < 0) return null;
  return r;
};
const escapeHtml = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function groupStats(group) {
  const teams = TEAMS.filter(t => t.group === group).map(t => ({
    ...t, p:0, w:0, d:0, l:0, gf:0, ga:0, gd:0, pts:0
  }));

  MATCHES.filter(m => m.group === group).forEach(m => {
    const r = result(m.id);
    if (!r) return;
    const home = teams.find(t => t.id === m.home);
    const away = teams.find(t => t.id === m.away);
    if (!home || !away) return;

    home.p++; away.p++;
    home.gf += r.home; home.ga += r.away;
    away.gf += r.away; away.ga += r.home;

    if (r.home > r.away) {
      home.w++; home.pts += 3; away.l++;
    } else if (r.home < r.away) {
      away.w++; away.pts += 3; home.l++;
    } else {
      home.d++; away.d++; home.pts++; away.pts++;
    }
  });

  teams.forEach(t => t.gd = t.gf - t.ga);
  // Premier League-style ordering: points, goal difference, goals scored.
  return teams.sort((a,b) =>
    b.pts-a.pts || b.gd-a.gd || b.gf-a.gf || a.name.localeCompare(b.name)
  );
}

function winnerId(matchId) {
  const r = result(matchId);
  if (!r || r.home === r.away) return null;
  const m = MATCHES.find(x => x.id === matchId);
  return r.home > r.away ? m.home : m.away;
}
function winnerName(matchId) {
  const id = winnerId(matchId);
  if (!id) return null;
  if (id === "SF1W") return winnerName("SF1");
  if (id === "SF2W") return winnerName("SF2");
  return teamName(id);
}
function loserId(matchId) {
  const r = result(matchId);
  if (!r || r.home === r.away) return null;
  const m = MATCHES.find(x => x.id === matchId);
  return r.home < r.away ? m.home : m.away;
}
function semiParticipants(matchId) {
  const a = groupStats("A"), b = groupStats("B");
  if (matchId === "SF1") return [a[0]?.id, b[1]?.id];
  if (matchId === "SF2") return [b[0]?.id, a[1]?.id];
  return ["SF1W", "SF2W"];
}
function displayTeam(id) {
  if (!id) return "Awaiting group results";
  if (id === "SF1W") return winnerName("SF1") || "Semi-final 1 winner";
  if (id === "SF2W") return winnerName("SF2") || "Semi-final 2 winner";
  return teamName(id);
}
function matchTeams(m) {
  if (m.id === "SF1" || m.id === "SF2") {
    const ids = semiParticipants(m.id);
    return [displayTeam(ids[0]), displayTeam(ids[1])];
  }
  return [displayTeam(m.home), displayTeam(m.away)];
}
function renderTables() {
  [["A","tableA"],["B","tableB"]].forEach(([group,target]) => {
    const teams = groupStats(group);
    $(target).innerHTML = teams.map((t,i) => `
      <tr class="${i < 2 ? "qualifier" : "relegated"}">
        <td><span class="team-rank">${i+1}</span></td>
        <td>${escapeHtml(t.name)}</td><td>${t.p}</td><td>${t.w}</td>
        <td>${t.d}</td><td>${t.l}</td><td>${t.gf}</td><td>${t.ga}</td>
        <td>${t.gd > 0 ? "+" : ""}${t.gd}</td><td class="points">${t.pts}</td>
      </tr>`).join("");
  });
}
function renderMatchCard(m) {
  const r = result(m.id), [home,away] = matchTeams(m);
  const isPlayed = !!r;
  const status = isPlayed ? "RESULT ENTERED" : "UPCOMING";
  let outcome = "Not played";
  if (r) {
    if (r.home === r.away) outcome = "DRAW";
    else outcome = r.home > r.away ? `${home} WIN` : `${away} WIN`;
  }
  return `<article class="match-card">
    <div class="match-meta"><span>${m.round}</span><span class="status ${isPlayed?"played":""}">${status}</span></div>
    <div class="match-team"><span>${escapeHtml(home)}</span><span class="score-box">${r ? r.home : "—"}</span></div>
    <div class="match-team"><span>${escapeHtml(away)}</span><span class="score-box">${r ? r.away : "—"}</span></div>
    <div class="match-bottom"><span>${m.day} · ${m.time}</span><b>${escapeHtml(outcome)}</b></div>
  </article>`;
}
function renderFixtures() {
  $("groupFixtures").innerHTML = MATCHES.filter(m => !m.knockout).map(renderMatchCard).join("");
  $("knockoutFixtures").innerHTML = MATCHES.filter(m => m.knockout).map(renderMatchCard).join("");
}
function renderBracket() {
  const a = groupStats("A"), b = groupStats("B");
  $("sf1a").textContent = a[0]?.name || "Group A · 1st";
  $("sf1b").textContent = b[1]?.name || "Group B · 2nd";
  $("sf2a").textContent = b[0]?.name || "Group B · 1st";
  $("sf2b").textContent = a[1]?.name || "Group A · 2nd";

  const sf1 = result("SF1"), sf2 = result("SF2"), finalResult = result("F");
  $("sf1ascore").textContent = sf1 ? sf1.home : "—";
  $("sf1bscore").textContent = sf1 ? sf1.away : "—";
  $("sf2ascore").textContent = sf2 ? sf2.home : "—";
  $("sf2bscore").textContent = sf2 ? sf2.away : "—";
  $("finala").textContent = winnerName("SF1") || "Semi-final 1 winner";
  $("finalb").textContent = winnerName("SF2") || "Semi-final 2 winner";
  $("finalascore").textContent = finalResult ? finalResult.home : "—";
  $("finalbscore").textContent = finalResult ? finalResult.away : "—";

  let champion = "The champion will be shown here after the final.";
  if (finalResult && finalResult.home !== finalResult.away) {
    champion = `🏆 Champion: ${finalResult.home > finalResult.away ? winnerName("SF1") : winnerName("SF2")}`;
  } else if (finalResult && finalResult.home === finalResult.away) {
    champion = "Final is tied — enter the score after extra time or penalties.";
  }
  $("championText").textContent = champion;
}
function renderAll() {
  renderTables();
  renderFixtures();
  renderBracket();
}
renderAll();
