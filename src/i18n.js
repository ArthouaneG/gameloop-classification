export const LANG_KEY = 'gameloop_lang';
export let currentLang = localStorage.getItem(LANG_KEY) || 'fr';

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
}

export function t(key) {
  return T[currentLang]?.[key] ?? T.fr[key] ?? key;
}

/** Steam API language string */
export function steamLang() {
  return currentLang === 'en' ? 'english' : 'french';
}

const T = {
  fr: {
    // ── INTRO
    'intro.subtitle': 'Système de classification du jeu vidéo',

    // ── NAV
    'nav.layers':  'Les Layers',
    'nav.venn':    'Diagramme',
    'nav.games':   'Jeux',
    'nav.chart':   'Graphique',
    'nav.discover':'Découverte',
    'nav.about':   'À propos',

    // ── HERO
    'hero.eyebrow':   'Théorie du Design de Jeu',
    'hero.title':     'Trois <em>layers</em><br/>pour tout classifier',
    'hero.desc':      'Chaque jeu vidéo s\'articule autour de trois dimensions imbriquées : l\'exécution brute, la gestion des probabilités et la maîtrise des systèmes. Leur intersection définit l\'identité d\'un jeu.',
    'hero.pill.micro':'Micro = Exécution',
    'hero.pill.meso': 'Meso = Probabilité',
    'hero.pill.macro':'Macro = Systèmes',
    'hero.cta':       'Explorer le diagramme',

    // ── LAYERS SECTION
    'layers.title': 'Les trois layers du jeu vidéo',
    'layers.sub':   'Cliquez sur une carte pour ouvrir la bulle d\'informations.',

    // Micro card
    'micro.tagline': 'Ce que vous faites, la manière dont vous le faites.',
    'micro.desc':    'Le layer micro définit votre capacité d\'exécution : aim, timing, skill individuel. C\'est le domaine des actions concrètes, mesurables, répétables.',
    'micro.tags':    '<span class="tag">Aim</span><span class="tag">Timing</span><span class="tag">Combos</span><span class="tag">Précision</span>',
    'micro.btn':     'En savoir plus',
    'micro.bubble':  `<h4 class="micro-text">Execution Layer</h4>
      <p>Le layer <strong>micro</strong> répond à la question : <em>« Est-ce que je suis capable d'exécuter cette action ? »</em></p>
      <p>C'est la dimension physique et sensorimotrice du jeu. Elle est dominante lorsque le résultat dépend directement de votre précision, votre vitesse ou votre coordination.</p>
      <ul>
        <li><strong>Exemples d'actions :</strong> viser une tête, maintenir un combo, placer un dash parfait</li>
        <li><strong>Compétence clé :</strong> muscle memory, réflexes, précision</li>
        <li><strong>Feedback :</strong> immédiat, visuel, sonore</li>
        <li><strong>Jeux purs :</strong> Osu!, Guitar Hero, Celeste</li>
      </ul>`,

    // Meso card
    'meso.tagline': 'Ce que vous lisez, la façon dont vous vous adaptez.',
    'meso.desc':    'Le layer meso est celui de l\'adaptabilité et de la probabilité. Vous gérez l\'incertain — la position adverse, les probabilités de tirage, les rotations possibles.',
    'meso.tags':    '<span class="tag">Lecture</span><span class="tag">Adaptation</span><span class="tag">Probabilité</span><span class="tag">Anticipation</span>',
    'meso.btn':     'En savoir plus',
    'meso.bubble':  `<h4 class="meso-text">Probability Layer</h4>
      <p>Le layer <strong>meso</strong> répond à la question : <em>« Qu'est-ce qui va probablement se passer ? »</em></p>
      <p>C'est la dimension probabiliste et contextuelle du jeu. Elle domine lorsque le résultat dépend de votre capacité à lire une situation, anticiper l'adversaire et adapter votre stratégie en temps réel.</p>
      <ul>
        <li><strong>Exemples d'actions :</strong> lire un bluff, anticiper un rush, adapter son deck, gérer une économie</li>
        <li><strong>Compétence clé :</strong> game sense, adaptabilité, lecture des patterns</li>
        <li><strong>Feedback :</strong> différé, contextuel</li>
        <li><strong>Jeux purs :</strong> Poker, Among Us, Hearthstone (partiel)</li>
      </ul>`,

    // Macro card
    'macro.tagline': 'Comment vous jouez le jeu de manière mathématiquement optimale.',
    'macro.desc':    'Le layer macro est celui de la maîtrise des systèmes : économie, build orders, optimisation des ressources. Vous jouez le jeu lui-même, pas juste la partie en cours.',
    'macro.tags':    '<span class="tag">Build order</span><span class="tag">Économie</span><span class="tag">Meta</span><span class="tag">Optimisation</span>',
    'macro.btn':     'En savoir plus',
    'macro.bubble':  `<h4 class="macro-text">Systems Layer</h4>
      <p>Le layer <strong>macro</strong> répond à la question : <em>« Comment puis-je jouer ce jeu de manière optimale ? »</em></p>
      <p>C'est la dimension systémique et mathématique du jeu. Elle domine lorsque le résultat dépend de votre compréhension des systèmes sous-jacents — méta-jeu, théorie, optimisation.</p>
      <ul>
        <li><strong>Exemples d'actions :</strong> calculer le meilleur build, optimiser l'économie de carte, maîtriser le méta</li>
        <li><strong>Compétence clé :</strong> théorie, analyse, optimisation systémique</li>
        <li><strong>Feedback :</strong> long terme, statistique</li>
        <li><strong>Jeux purs :</strong> Civilization VI, Factorio, Chess</li>
      </ul>`,

    // ── VENN SECTION
    'venn.title':       'Diagramme de classification',
    'venn.sub':         'Cliquez sur une zone pour filtrer les jeux correspondants.',
    'venn.placeholder': 'Cliquez sur une zone du diagramme pour voir les jeux qui lui correspondent.',

    // ── GAMES SECTION
    'games.title': 'Jeux classifiés',
    'games.sub':   'Position de chaque jeu dans le diagramme de Venn.',

    // Filter buttons
    'filter.all':        'Tous',
    'filter.micro':      'Micro pur',
    'filter.macro':      'Macro pur',
    'filter.meso':       'Meso pur',
    'filter.micro-macro':'Micro + Macro',
    'filter.micro-meso': 'Micro + Meso',
    'filter.meso-macro': 'Meso + Macro',
    'filter.all-three':  'Les trois',

    // ── CHART SECTION
    'chart.title': 'Graphique comparatif',
    'chart.sub':   'Score de chaque layer pour une sélection de jeux (sur 10).',

    // ── DISCOVER SECTION
    'discover.title':   'Découverte Steam',
    'discover.sub':     'Top jeux actuellement joués sur Steam — classifiez-les avec la communauté.',
    'discover.loading': 'Chargement du top Steam…',
    'discover.badge':   'À CLASSER',
    'discover.error':   '⚠ Steam API indisponible — lance le serveur de dev Vite pour activer le proxy.',
    'discover.done':    '✓ Top Steam chargé — %n nouveaux jeux à classer',
    'discover.alldone': 'Tous les top jeux sont déjà classifiés !',

    // ── ABOUT SECTION
    'about.title':      'À propos',
    'about.sub':        'Ce site est une visualisation interactive de la théorie Micro · Meso · Macro du jeu vidéo, créée par <strong class="micro-text">Surnex</strong>.',
    'about.creator.tag':'Théorie originale par',
    'about.creator.bio':'Surnex est un créateur de contenu YouTube américain anglophone spécialisé dans <em>la performance humaine et la cognition dans le jeu vidéo</em>. Actif depuis 2017, il explore les patterns universels qui déterminent pourquoi certains jeux exigent davantage des joueurs. Son cadre Micro / Meso / Macro offre une lentille rigoureuse pour comprendre la profondeur compétitive de tous les genres.',
    'about.stat.subs':  '24,7k abonnés',
    'about.stat.videos':'124 vidéos',
    'about.stat.since': 'Depuis jan. 2017',
    'about.link.yt':    'Chaîne YouTube',
    'about.link.disc':  'Discord',
    'about.link.video': 'Voir la vidéo →',
    'about.video.h':    'La vidéo originale',
    'about.video.p':    'Regardez la vidéo de Surnex pour comprendre en profondeur le cadre de classification et pourquoi il s\'applique à tous les jeux compétitifs.',
    'about.video.cta':  'Regarder sur YouTube →',
    'about.theory.h':   'Les trois layers',
    'about.theory.p':   'Selon Surnex, tout jeu peut être décomposé selon la proportion de ces trois dimensions :',
    'about.theory.list':`<li><span class="micro-text">Micro — Execution Layer</span><br><span class="layer-def">Ce que tu fais physiquement : aim, timing, combos, précision. La compétence se prouve dans l'instant.</span></li>
        <li><span class="meso-text">Meso — Probability Layer</span><br><span class="layer-def">Ce que tu lis et anticipes : probabilité, adaptation, game sense. Tu joues contre l'incertain.</span></li>
        <li><span class="macro-text">Macro — Systems Layer</span><br><span class="layer-def">Comment tu optimises : économie, méta, build orders. Tu joues le jeu mathématiquement.</span></li>`,
    'about.theory.note':'Les jeux les plus forts exigent la maîtrise des trois — c\'est la zone centrale du diagramme de Venn.',
    'about.site.h':     'Ce site',
    'about.site.p':     'GameLoop Classification est une visualisation interactive non-officielle basée sur le cadre de Surnex. Explorez le Top Steam selon cette lentille et votez pour chaque jeu.',
    'about.site.list':  `<li><strong>Vite.js</strong> — build moderne & rapide</li>
        <li><strong>Anime.js v4</strong> — animations fluides</li>
        <li><strong>Steam API</strong> — données en temps réel</li>
        <li><strong>localStorage</strong> — votes communautaires</li>`,
    'about.site.note':  'Toute la classification est basée sur le cadre de Surnex. <a href="https://www.youtube.com/@real_surnex" target="_blank" rel="noopener" class="inline-link">Suivez-le sur YouTube.</a>',

    // ── FOOTER
    'footer.text': 'Game Loop Classification System — Cadre Micro / Meso / Macro du game design',

    // ── ZONES
    'zone.micro.label':       'Micro pur',
    'zone.micro.sub':         'Execution Layer',
    'zone.macro.label':       'Macro pur',
    'zone.macro.sub':         'Systems Layer',
    'zone.meso.label':        'Meso pur',
    'zone.meso.sub':          'Probability Layer',
    'zone.micro-macro.label': 'Micro + Macro',
    'zone.micro-macro.sub':   'Execution + Systems',
    'zone.micro-meso.label':  'Micro + Meso',
    'zone.micro-meso.sub':    'Execution + Probability',
    'zone.meso-macro.label':  'Meso + Macro',
    'zone.meso-macro.sub':    'Probability + Systems',
    'zone.all-three.label':   'Les trois',
    'zone.all-three.sub':     'Execution + Probability + Systems',
    'zone.micro.short':       'Micro',
    'zone.macro.short':       'Macro',
    'zone.meso.short':        'Meso',
    'zone.micro-macro.short': 'Micro · Macro',
    'zone.micro-meso.short':  'Micro · Meso',
    'zone.meso-macro.short':  'Meso · Macro',
    'zone.all-three.short':   'Les trois',

    // ── DYNAMIC (vote / modal / cards)
    'vote.classify':   'Classer ce jeu',
    'vote.yourvote':   'Votre vote',
    'vote.total':      '%n vote(s) au total',
    'badge.unclass':   'À CLASSER',
    'peak.players':    '⚡ %n joueurs en pic',
    'modal.loading':   'Chargement…',
    'modal.desc':      'Description',
    'modal.classif':   'Classification',
    'modal.reviews':   'Reviews Steam',
    'modal.steam':     'Voir sur Steam →',
    'modal.no.desc':   'Aucune description disponible.',
    'modal.no.classif':'Participez aux votes pour classifier ce jeu !',
    'modal.dev.proxy': 'Proxy dev requis',
    'count.game':      'jeu',
    'count.games':     'jeux',
    'venn.game':       '%n jeu',
    'venn.games':      '%n jeux',
  },

  en: {
    // ── INTRO
    'intro.subtitle': 'Video Game Classification System',

    // ── NAV
    'nav.layers':  'The Layers',
    'nav.venn':    'Diagram',
    'nav.games':   'Games',
    'nav.chart':   'Chart',
    'nav.discover':'Discover',
    'nav.about':   'About',

    // ── HERO
    'hero.eyebrow':   'Game Design Theory',
    'hero.title':     'Three <em>layers</em><br/>to classify everything',
    'hero.desc':      'Every video game revolves around three intertwined dimensions: raw execution, probability management, and system mastery. Their intersection defines a game\'s identity.',
    'hero.pill.micro':'Micro = Execution',
    'hero.pill.meso': 'Meso = Probability',
    'hero.pill.macro':'Macro = Systems',
    'hero.cta':       'Explore the diagram',

    // ── LAYERS SECTION
    'layers.title': 'The three layers of video games',
    'layers.sub':   'Click a card to open the information bubble.',

    // Micro card
    'micro.tagline': 'What you do, and how you do it.',
    'micro.desc':    'The micro layer defines your execution ability: aim, timing, individual skill. It\'s the domain of concrete, measurable, repeatable actions.',
    'micro.tags':    '<span class="tag">Aim</span><span class="tag">Timing</span><span class="tag">Combos</span><span class="tag">Precision</span>',
    'micro.btn':     'Learn more',
    'micro.bubble':  `<h4 class="micro-text">Execution Layer</h4>
      <p>The <strong>micro</strong> layer answers the question: <em>"Am I capable of executing this action?"</em></p>
      <p>This is the physical and sensorimotor dimension of gaming. It dominates when the outcome depends directly on your precision, speed, or coordination.</p>
      <ul>
        <li><strong>Example actions:</strong> headshots, maintaining combos, landing a perfect dash</li>
        <li><strong>Key skill:</strong> muscle memory, reflexes, precision</li>
        <li><strong>Feedback:</strong> immediate, visual, auditory</li>
        <li><strong>Pure examples:</strong> Osu!, Guitar Hero, Celeste</li>
      </ul>`,

    // Meso card
    'meso.tagline': 'What you read, and how you adapt.',
    'meso.desc':    'The meso layer is all about adaptability and probability. You manage uncertainty — the opponent\'s position, draw probabilities, possible rotations.',
    'meso.tags':    '<span class="tag">Reading</span><span class="tag">Adaptation</span><span class="tag">Probability</span><span class="tag">Anticipation</span>',
    'meso.btn':     'Learn more',
    'meso.bubble':  `<h4 class="meso-text">Probability Layer</h4>
      <p>The <strong>meso</strong> layer answers the question: <em>"What is likely to happen next?"</em></p>
      <p>This is the probabilistic and contextual dimension of gaming. It dominates when the outcome depends on your ability to read a situation, anticipate opponents, and adapt your strategy in real time.</p>
      <ul>
        <li><strong>Example actions:</strong> reading a bluff, anticipating a rush, adapting your deck, managing an economy</li>
        <li><strong>Key skill:</strong> game sense, adaptability, pattern recognition</li>
        <li><strong>Feedback:</strong> delayed, contextual</li>
        <li><strong>Pure examples:</strong> Poker, Among Us, Hearthstone (partial)</li>
      </ul>`,

    // Macro card
    'macro.tagline': 'How you play the game in a mathematically optimal way.',
    'macro.desc':    'The macro layer is about system mastery: economy, build orders, resource optimization. You\'re playing the game itself, not just the current match.',
    'macro.tags':    '<span class="tag">Build order</span><span class="tag">Economy</span><span class="tag">Meta</span><span class="tag">Optimization</span>',
    'macro.btn':     'Learn more',
    'macro.bubble':  `<h4 class="macro-text">Systems Layer</h4>
      <p>The <strong>macro</strong> layer answers the question: <em>"How can I play this game optimally?"</em></p>
      <p>This is the systemic and mathematical dimension of gaming. It dominates when the outcome depends on your understanding of the underlying systems — metagame, theory, optimization.</p>
      <ul>
        <li><strong>Example actions:</strong> calculating the optimal build, optimizing card economy, mastering the meta</li>
        <li><strong>Key skill:</strong> theory, analysis, systemic optimization</li>
        <li><strong>Feedback:</strong> long-term, statistical</li>
        <li><strong>Pure examples:</strong> Civilization VI, Factorio, Chess</li>
      </ul>`,

    // ── VENN SECTION
    'venn.title':       'Classification diagram',
    'venn.sub':         'Click a zone to filter matching games.',
    'venn.placeholder': 'Click a zone in the diagram to see matching games.',

    // ── GAMES SECTION
    'games.title': 'Classified games',
    'games.sub':   'Each game\'s position in the Venn diagram.',

    // Filter buttons
    'filter.all':        'All',
    'filter.micro':      'Pure Micro',
    'filter.macro':      'Pure Macro',
    'filter.meso':       'Pure Meso',
    'filter.micro-macro':'Micro + Macro',
    'filter.micro-meso': 'Micro + Meso',
    'filter.meso-macro': 'Meso + Macro',
    'filter.all-three':  'All Three',

    // ── CHART SECTION
    'chart.title': 'Comparative chart',
    'chart.sub':   'Layer score for a selection of games (out of 10).',

    // ── DISCOVER SECTION
    'discover.title':   'Steam Discovery',
    'discover.sub':     'Top games currently played on Steam — classify them with the community.',
    'discover.loading': 'Loading Steam top charts…',
    'discover.badge':   'TO CLASSIFY',
    'discover.error':   '⚠ Steam API unavailable — launch the Vite dev server to enable the proxy.',
    'discover.done':    '✓ Steam top loaded — %n new games to classify',
    'discover.alldone': 'All top games are already classified!',

    // ── ABOUT SECTION
    'about.title':      'About',
    'about.sub':        'An interactive visualization of the Micro · Meso · Macro video game theory, created by <strong class="micro-text">Surnex</strong>.',
    'about.creator.tag':'Original theory by',
    'about.creator.bio':'Surnex is an American English-speaking YouTube creator focused on <em>human performance and cognition in gaming</em>. Active since 2017, he explores the universal patterns that determine why some games demand more from players than others. His Micro / Meso / Macro framework provides a rigorous lens for understanding competitive depth across all game genres.',
    'about.stat.subs':  '24.7k subscribers',
    'about.stat.videos':'124 videos',
    'about.stat.since': 'Since Jan 2017',
    'about.link.yt':    'YouTube Channel',
    'about.link.disc':  'Discord',
    'about.link.video': 'Watch the video →',
    'about.video.h':    'The original video',
    'about.video.p':    'Watch Surnex\'s video to fully understand the classification framework and why it applies universally to competitive games.',
    'about.video.cta':  'Watch on YouTube →',
    'about.theory.h':   'The three layers',
    'about.theory.p':   'According to Surnex, any game can be broken down by how much it demands from each of these three dimensions:',
    'about.theory.list':`<li><span class="micro-text">Micro — Execution Layer</span><br><span class="layer-def">What you physically do: aim, timing, combos, precision. Skill proven in the moment.</span></li>
        <li><span class="meso-text">Meso — Probability Layer</span><br><span class="layer-def">What you read and anticipate: probability, adaptation, game sense. Playing against uncertainty.</span></li>
        <li><span class="macro-text">Macro — Systems Layer</span><br><span class="layer-def">How you optimize: economy, meta, build orders. Playing the game mathematically.</span></li>`,
    'about.theory.note':'The strongest games demand mastery of all three — that\'s the center zone of the Venn diagram.',
    'about.site.h':     'About this site',
    'about.site.p':     'GameLoop Classification is an unofficial interactive visualization built on Surnex\'s framework. Explore the Steam Top charts through this lens and vote on where each game belongs.',
    'about.site.list':  `<li><strong>Vite.js</strong> — fast modern build</li>
        <li><strong>Anime.js v4</strong> — smooth animations</li>
        <li><strong>Steam API</strong> — live game data</li>
        <li><strong>localStorage</strong> — community votes</li>`,
    'about.site.note':  'All classification is based on Surnex\'s framework. <a href="https://www.youtube.com/@real_surnex" target="_blank" rel="noopener" class="inline-link">Follow him on YouTube.</a>',

    // ── FOOTER
    'footer.text': 'Game Loop Classification System — Micro / Meso / Macro game design framework',

    // ── ZONES
    'zone.micro.label':       'Pure Micro',
    'zone.micro.sub':         'Execution Layer',
    'zone.macro.label':       'Pure Macro',
    'zone.macro.sub':         'Systems Layer',
    'zone.meso.label':        'Pure Meso',
    'zone.meso.sub':          'Probability Layer',
    'zone.micro-macro.label': 'Micro + Macro',
    'zone.micro-macro.sub':   'Execution + Systems',
    'zone.micro-meso.label':  'Micro + Meso',
    'zone.micro-meso.sub':    'Execution + Probability',
    'zone.meso-macro.label':  'Meso + Macro',
    'zone.meso-macro.sub':    'Probability + Systems',
    'zone.all-three.label':   'All Three',
    'zone.all-three.sub':     'Execution + Probability + Systems',
    'zone.micro.short':       'Micro',
    'zone.macro.short':       'Macro',
    'zone.meso.short':        'Meso',
    'zone.micro-macro.short': 'Micro · Macro',
    'zone.micro-meso.short':  'Micro · Meso',
    'zone.meso-macro.short':  'Meso · Macro',
    'zone.all-three.short':   'All Three',

    // ── DYNAMIC
    'vote.classify':   'Classify this game',
    'vote.yourvote':   'Your vote',
    'vote.total':      '%n vote(s) total',
    'badge.unclass':   'TO CLASSIFY',
    'peak.players':    '⚡ %n peak players',
    'modal.loading':   'Loading…',
    'modal.desc':      'Description',
    'modal.classif':   'Classification',
    'modal.reviews':   'Steam Reviews',
    'modal.steam':     'View on Steam →',
    'modal.no.desc':   'No description available.',
    'modal.no.classif':'Vote to help classify this game!',
    'modal.dev.proxy': 'Dev proxy required',
    'count.game':      'game',
    'count.games':     'games',
    'venn.game':       '%n game',
    'venn.games':      '%n games',
  },
};
