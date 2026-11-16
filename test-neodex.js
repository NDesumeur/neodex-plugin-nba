// lancé par le test « local » de NeoDex, sans réseau : une carte de match agrandie, les moments forts, la comparaison de deux joueurs, puis le tableau des playoffs ; rien ne déborde
module.exports = async ({ pj, sleep }) => {
  await sleep(1500);
  const N = 'const v = document.querySelector(".appWrap").parentElement, F = v.__nba;';
  const over = `[...document.querySelectorAll('.appWrap *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).length`;
  // une carte de match
  const g = { id: '1', date: '2026-11-16T00:30Z', status: { type: { state: 'post', name: 'STATUS_FINAL', shortDetail: 'Final' } }, competitions: [{ competitors: [
    { homeAway: 'home', winner: true, score: '118', team: { abbreviation: 'BOS', shortDisplayName: 'Celtics', logo: '' }, records: [{ summary: '10-3' }] },
    { homeAway: 'away', winner: false, score: '109', team: { abbreviation: 'NY', shortDisplayName: 'Knicks', logo: '' }, records: [{ summary: '8-5' }] } ] }] };
  g.competitions[0].competitors.forEach(c => c.leaders = []);
  const c1 = await pj(`(() => { ${N} const g = ${JSON.stringify(g)}; g.competitions[0].competitors.forEach(c => c.leaders = []);
    const card = F.card({ e: g, c: g.competitions[0] }); document.getElementById('nbaGames').replaceChildren(card); F.show('games');
    return { score: parseFloat(getComputedStyle(card.querySelector('.nbaScore')).fontSize), w: Math.round(card.getBoundingClientRect().width), over: ${over} }; })()`);
  if (c1.score < 22 || c1.w < 330) throw new Error('carte de match trop petite : ' + JSON.stringify(c1));
  // les moments forts
  const vids = [{ headline: 'Tatum au buzzer', duration: 75, thumbnail: '', links: { web: { href: 'https://www.espn.com/video/clip?id=1' } } }, { headline: 'Sans lien' }, { headline: 'Le résumé', links: { source: { href: 'https://www.espn.com/video/clip?id=2' } } }];
  const v1 = await pj(`(() => { ${N} const c = F.videos(${JSON.stringify(vids)}); return c ? [...c.querySelectorAll('.nbaVid button')].map(b => b.dataset.href + ' ' + b.textContent) : null; })()`);
  if (!v1 || v1.length !== 2 || !/1:15/.test(v1[0])) throw new Error('moments forts : ' + JSON.stringify(v1));
  // la comparaison
  const pl = (id, name, s) => ({ a: { id, displayName: name, shortName: name, team: { displayName: 'Équipe ' + id } }, o: { statistics: { labels: ['GP', 'PTS', 'REB', 'TO'], splits: [{ displayName: 'Regular Season', stats: s }] } } });
  const cmp = await pj(`(() => { ${N} F.compare(${JSON.stringify(pl('1', 'J. Tatum', ['12', '27.1', '8.4', '2.9']))}, ${JSON.stringify(pl('2', 'J. Brunson', ['13', '25.0', '3.2', '2.1']))}, () => F.close());
    const rows = [...document.querySelectorAll('#nbaDetail .nbaCmp')]; return { n: rows.length, win: rows.map(r => r.querySelector('.nbaBar i.win') === r.querySelector('.nbaBar i') ? 'A' : r.querySelector('.nbaBar i.win') ? 'B' : '='), vs: !!document.querySelector('#nbaDetail .nbaVs'), over: ${over} }; })()`);
  if (cmp.n !== 4 || cmp.win.join('') !== 'BAAB' || !cmp.vs) throw new Error('comparaison : ' + JSON.stringify(cmp));
  if (cmp.over) throw new Error('comparaison : ' + cmp.over + ' élément(s) débordent');
  // le tableau des playoffs
  const T = 'BOS NY MIL CLE ORL IND MIA PHI ATL CHI BKN TOR CHA DET WSH OKC DEN MIN LAC DAL PHX LAL NO SAC GS HOU MEM UTA SA POR'.split(' ');
  const conf = (name, ab) => ({ name, standings: { entries: ab.map((a, i) => ({ team: { abbreviation: a, displayName: a, logos: [] }, stats: [{ name: 'playoffSeed', displayValue: String(15 - i) }, { name: 'wins', displayValue: String(20 + i) }, { name: 'losses', displayValue: String(10 - i % 10) }] })) } });
  const st = { children: [conf('Eastern Conference', T.slice(0, 15)), conf('Western Conference', T.slice(15))] };  // donnés à l'envers : le tri par place doit les remettre
  const br = await pj(`(() => { ${N} F.close(); F.show('playoffs'); F.playoffs(${JSON.stringify(st)});
    const cols = [...document.querySelectorAll('#nbaPlayoffs .nbaBr > div')], first = cols[6].querySelector('.nbaMu');
    return { cols: cols.length, mu: cols[0].querySelectorAll('.nbaMu').length + cols[6].querySelectorAll('.nbaMu').length, east1: [...first.querySelectorAll('span:not(.pi)')].map(s => s.textContent).join('-'),
      pi: document.querySelectorAll('#nbaPlayoffs .pi').length, over: ${over} }; })()`);
  if (br.cols !== 7 || br.mu !== 8 || br.east1 !== 'WSH-PHI' || br.pi !== 4) throw new Error('playoffs : ' + JSON.stringify(br));
  if (br.over) throw new Error('playoffs : ' + br.over + ' élément(s) débordent');
  return 'carte en ' + c1.score + ' px, 2 moments forts, comparaison sur 4 stats (' + cmp.win.join('') + '), tableau des playoffs avec 8 affiches (1er Est contre 8e : ' + br.east1 + ')';
};
