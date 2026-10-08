import { readFileSync, writeFileSync } from 'node:fs';

const replacements = [
  ['2c62acf3468c4cbbba6b82f1035bfe22', 'maptour', 'a5019e8c55d547eab69c0777dcd7509a', 'A walking tour of the National Mall', 'webmap'],
  ['ad0d1a4a0c5e474fb52f8062de68d035', 'maptour', '016c31c6dcd54c7ca635cc63e4bc82a4', 'Epic Flight'],
  ['5afdbed13fad458cb6288c46a0bad060', 'maptour', 'd79e17055aa14e119c9c6e8621b23a6a', 'Monuments Men'],
  ['d6635d5602b04c05a445058f53da5cb5', 'mapjournal', '68affb679afc40718babf3493927b4ac', 'The Great In-Between'],
  ['https://storymaps.arcgis.com/stories/749af21064e34f029bdd53946d9d941a', 'mapjournal', '86b78bfd59a0405bba1540eb9ecbffb1', 'There are Riches Here.'],
  ['ef703d9454bb4e4e8a9c1b086b5b66b5', 'mapseries', '77245a2c7bb540878fd3b24ebd048b20', 'Stewardship'],
  ['https://www.staridasgeography.gr/web-gis/story-maps/map-series/footpaths-of-erissos/en/', 'mapseries', '167ca9b1c85e4c7ea5eac8c6be43358b', 'Favorite Places: Paris Cafes'],
  ['https://storymaps.arcgis.com/stories/7d1db2f4802a46f5ba785c651f81053a', 'cascade', 'dbc3574e3d0d4f4a81ae95f2e86b0dc2', 'Palau'],
  ['f2e8448fef064238ace4f324ffc16fde', 'cascade', 'dbc3574e3d0d4f4a81ae95f2e86b0dc2', 'Palau'],
  ['https://storymaps.esri.com/stories/2017/the-uprooted/', 'cascade', '9497dbc933bc46efacc5236722cebde6', 'Seeing Green Infrastructure'],
  ['https://storymaps.esri.com/stories/shortlist-sandiego', 'shortlist', '0584dbad6ebf433a96f1111f4cc7e3bd', 'San Diego Shortlist'],
  ['https://storymaps.esri.com/stories/2017/flw/buildings/', 'shortlist', '62eef62250984b188b7512ec8f1caadb', 'Palm Springs Shortlist'],
  ['https://storymaps.esri.com/stories/2016/national-park-memories/', 'crowdsource', 'f1fcc302b0864b0c94beffc5177da2b8', 'San Diego Cool'],
  ['https://storymaps.esri.com/stories/honoring-our-veterans/index.html', 'crowdsource', '467eccf026ca416cae01a2c6f086b2b9', 'The 2016 Esri UC Selfie Story Map'],
  ['c7ad1a55de0247a68454a76f251225a4', 'crowdsource', '467eccf026ca416cae01a2c6f086b2b9', 'The 2016 Esri UC Selfie Story Map'],
  ['a0a12caf5025441497d49d35b01a07f8', 'basic', 'ef329532de2645239789978efe531f3b', 'Brazil: World Cup Stadiums and Interesting Places'],
  ['http://www.esrinl.nl/storymaps/Flitsmeister/Flitsrisico/index.html', 'basic', '30066075caa947178f6c2ae438e7efa4', 'Wildlife Strikes by Month'],
  ['716b6277db404a5aaf2406f7bb444295', 'swipe', '5c851a0bd60d42f0b2955966ee933465', 'Swipe to the Past: Washington DC 1851 and Today'],
  ['https://storymaps.esri.com/stories/diabetes/', 'swipe', '4e44be0f61094d6ab36a1a1df215daed', 'The Linked Burdens of Obesity and Diabetes'],
];

const viewerUrl = (runtime, id, parameter = 'appid') => `/viewers/${runtime}/index.html?${parameter}=${id}`;

const sourceRepositories = {
  'map-tour': 'storymap-tour',
  basic: 'storymap-basic',
  cascade: 'storymap-cascade',
  crowdsource: 'storymap-crowdsource',
  'map-journal': 'storymap-journal',
  'map-series': 'storymap-series',
  shortlist: 'storymap-shortlist',
  'swipe-spyglass': 'storymap-swipe',
};

const archiveFooter = readFileSync(new URL('../apps/classic-storymaps-site/archive-root.html', import.meta.url), 'utf8')
  .match(/<footer class="footer sticky-footer">[\s\S]*?<\/footer>/)[0]
  .replaceAll('__SITE_BASE_PATH__', '');

const cascadeTutorialIds = new Set([
  '5cd671a4cf1844b7854220979574b927',
  '7a0c165e7b404073b686f95ef98d6241',
  '954145df6cf84e2d8bbea996438c99fb',
  'a644a02894d246b59ecad16fae25b767',
  'c4ed68ecb9d54d398dbf46dcde881471',
]);

const organizationLabels = {
  audubon: 'Audubon',
  noaa: 'NOAA',
  usda: 'USDA',
  npca: 'NPCA',
  boston: 'City of Boston',
  trust: 'Trust for Public Land',
  nature: 'The Nature Conservancy',
  natparksrvc: 'National Park Service',
  montana: 'Montana FWP',
  ncc: 'NCC',
  raster: 'Blue Raster',
  padcnr: 'PA DCNR',
};

const unavailableOrganizations = new Set([
  'montana', 'ncc', 'usda', 'natparksrvc', 'nature', 'trust', 'raster',
]);

for (const file of process.argv.slice(2)) {
  let html = readFileSync(file, 'utf8');
  const sourceRepository = sourceRepositories[file.match(/(?:^|\/)en__app-list__([^/]+)\.html$/)?.[1]];
  if (/(?:^|\/)en\.html$/.test(file)) {
    html = html.replace(/<div id="mini-gallery"[^>]*>\s*<\/div>\s*/g, '')
      .replace(/<div class="column-24 center-text trailer-3">\s*<a href="#"><h4>View more story maps in our gallery<\/h4><\/a>\s*<\/div>/g, '');
  }
  if (/(?:^|\/)en__faq\.html$/.test(file)) {
    html = html.replace(/<a\b[^>]*href="#"[^>]*>(Story Maps Gallery)<\/a>/g, '$1');
    html = html.replace(/<header class="question" id="question(?:6|19)">[\s\S]*?<div><a class="faq-to-top"/g, section =>
      section.replace(/<a\b[^>]*href="#"[^>]*>this link<\/a>/, 'this link'));
    html = html.replace(/<header class="question" id="question9">[\s\S]*?<div><a class="faq-to-top"/, section =>
      section.replace(/<a\b[^>]*href="#"[^>]*>(linked|embedded)<\/a>/g, '$1'));
  }
  html = html.replace(/<footer class="footer sticky-footer">[\s\S]*?<\/footer>/g, archiveFooter);
  html = html.replace(/<a\b([^>]*\bhref="([^"]*)"[^>]*)>([\s\S]*?)<\/a>/g, (anchor, attributes, href, body) => {
    const label = body.replace(/<[^>]*>/g, '').trim();
    if (sourceRepository && ['Download the ready-to-deploy app', 'Download current source (ZIP)', 'Get the source code on GitHub'].includes(label)) {
      const repositoryUrl = `https://github.com/Esri/${sourceRepository}`;
      const destination = label === 'Get the source code on GitHub' ? repositoryUrl : `${repositoryUrl}/archive/refs/heads/master.zip`;
      attributes = attributes.replace(/\bhref="[^"]*"/, `href="${destination}"`)
        .replace(/\s+(?:target|rel)="[^"]*"/g, '');
      return `<a${attributes} target="_blank" rel="noopener noreferrer">${body.replace('Download the ready-to-deploy app', 'Download current source (ZIP)')}</a>`;
    }
    if (label === "Story Maps Developers' Corner") return body;
    if (/(?:^|\/)en__app-list__(?:playlist|countdown)(?:__tutorial)?\.html$/.test(file)
      && /^(?:http:\/\/bit\.ly\/(?:1cImr14|1eML1U4)|https:\/\/github\.com\/Esri\/(?:playlist|countdown)-storytelling-template-js(?:\/archive\/master\.zip)?)$/.test(href)) {
      return body;
    }
    if (href === '#' && /^(?:Learn ArcGIS online lesson|'Get Started with Story Maps' Learn ArcGIS lesson)$/.test(label)) {
      attributes = attributes.replace(/\bhref="[^"]*"/, 'href="https://learn.arcgis.com"')
        .replace(/\s+(?:target|rel)="[^"]*"/g, '');
      return `<a${attributes} target="_blank" rel="noopener noreferrer">${body}</a>`;
    }
    const url = new URL(href.replaceAll('&amp;', '&'), 'https://example.invalid');
    if ((url.hostname === 'geoportal.tversu.ru' && url.pathname === '/Atlas/norway12/index.html')
      || (url.hostname === 'fishandgame.idaho.gov' && url.pathname === '/ifwis/maps/wma/')) {
      return body.replace(/\s*<h6>View this story map<\/h6>/, '');
    }
    if (url.hostname === 'geonet.esri.com' && url.pathname === '/thread/150596') {
      return anchor.replace(/\bhref="[^"]*"/, 'href="https://community.esri.com/en/discussion/comment/499570#Comment_499570"');
    }
    if (/(?:^|\/)en__faq\.html$/.test(file) && label === 'here'
      && url.hostname === 'storymaps.arcgis.com' && url.pathname === '/en/gallery/') {
      return body;
    }
    const originalHref = href.replace(/^(?:https?:\/\/web\.archive\.org)?\/web\/\d+(?:id_)?\//, '');
    const blogUrl = new URL(originalHref, 'https://example.invalid');
    if (blogUrl.hostname === 'links.esri.com' && blogUrl.pathname === '/storymaps/newsletter_signup') {
      return anchor.replace(/\bhref="[^"]*"/, 'href="https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/newsletter-signup"');
    }
    if (/(^|\.)(?:(?:twitter|x|facebook|instagram|linkedin|pinterest|tiktok|youtube|flickr)\.com|threads\.net|bsky\.app|youtu\.be)$/.test(blogUrl.hostname)) {
      return body;
    }
    if (blogUrl.hostname === 'collections.storymaps.esri.com'
      || (blogUrl.hostname === 'links.esri.com'
        && /^\/storymaps\/story_map_collections?(?:_|\/|$)/.test(blogUrl.pathname))) {
      return body;
    }
    if (blogUrl.hostname === 'marketplace.arcgis.com' && blogUrl.pathname === '/') {
      return anchor.replace(/\bhref="[^"]*"/, 'href="https://support.esri.com/en-us/knowledge-base/arcgis-marketplace-retirement-000041842"');
    }
    if (blogUrl.hostname === 'blogs.esri.com'
      || blogUrl.hostname === 'developerscorner.storymaps.arcgis.com'
      || /(^|\.)medium\.com$/.test(blogUrl.hostname)
      || (/(^|\.)esri\.com$/.test(blogUrl.hostname) && blogUrl.pathname.startsWith('/arcgis-blog/'))
      || (blogUrl.hostname === 'links.esri.com'
        && /^\/storymaps\/(?:blogs?_|tips_(?:general|cascade|crowdsource)(?:\/|$))/.test(blogUrl.pathname))
      || /\bblog(?:s|\s+posts?)?\b/i.test(label)) {
      return anchor.replace(/\bhref="[^"]*"/, 'href="/archive/2017-12-10-pages/en__archive-blog.html"');
    }
    if (/^https?:\/\/storymaps\.(?:arcgis|esri)\.com\/en\/five-principles\/?$/.test(originalHref)) {
      return anchor.replace(/\bhref="[^"]*"/, 'href="/archive/2017-12-10-pages/en__five-principles.html"');
    }
    if (url.hostname === 'nation.maps.arcgis.com' && url.pathname === '/apps/Cascade/index.html'
      && cascadeTutorialIds.has(url.searchParams.get('appid'))) {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('cascade', url.searchParams.get('appid'))}"`);
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/user/audubon') {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('mapseries', '3c48121bd41945d68aacd1ded71841a4')}"`);
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/user/city_boston') {
      attributes = attributes.replace(/\bhref="[^"]*"/, 'href="https://boston.maps.arcgis.com/home/gallery.html?sortField=relevance&amp;sortOrder=desc&amp;mode=keyword&amp;focus=applications-storymap"')
        .replace(/\s+(?:target|rel)="[^"]*"/g, '');
      return `<a${attributes} target="_blank" rel="noopener noreferrer">${body}</a>`;
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/smotm_dec2017') {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('cascade', '36b4887370d141fcbb35392f996c82d9')}"`);
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/make_your_story_map_sing') {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('cascade', 'dcd5d01e2b0342fe90cf3b8ca9ab8302')}"`);
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/an_introduction_presentation') {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('mapseries', '4aaf9036c7324b0cb5c8ee3e609126e7')}"`);
    }
    if (url.hostname === 'links.esri.com' && url.pathname === '/storymaps/story_map_tour_html_formatting_in_caption_example') {
      return anchor.replace(/\bhref="[^"]*"/, `href="${viewerUrl('maptour', 'd5b2c90d8a53466f9c3efb0f25d13325')}"`);
    }
    if (url.hostname === 'storymaps.esri.com' && [
      '/stories/2013/20towns/',
      '/stories/2013/ports/',
      '/stories/2013/refugee-camps/',
    ].includes(url.pathname)) {
      return anchor.replace(/\bhref="[^"]*"/, `href="https://storymaps.esri.com/archives${url.pathname}"`);
    }
    if (url.href === 'https://links.esri.com/storymaps/user/noaa') {
      return anchor.replace(/\bhref="[^"]*"/, 'href="https://web.archive.org/web/20250223200002/https://oceanservice.noaa.gov/map-stories/welcome.html"');
    }
    const replacement = replacements.find(([previous]) => /^[a-f0-9]{32}$/.test(previous)
      ? (url.searchParams.get('appid') || url.searchParams.get('webmap')) === previous
      : url.href.replace(/\/$/, '') === previous.replace(/\/$/, ''));
    if (!replacement) return anchor;
    const [, runtime, id, title, parameter] = replacement;
    attributes = attributes.replace(/\bhref="[^"]*"/, `href="${viewerUrl(runtime, id, parameter)}"`);
    body = body.replace(/<img\b[^>]*>/g, image => image
      .replace(/\bsrc="[^"]*"/, `src="/viewers/assets/images/examples/${id}.jpg"`)
      .replace(/\balt="[^"]*"/, `alt="${title}"`));
    return `<a${attributes}>${body}</a>`;
  });
  html = html.replace(/(<div class="app-text">)([\s\S]*?)(<\/div>)/g, (block, opening, content, closing) => {
    const sample = content.includes('Tabbed Layout') ? viewerUrl('mapseries', '6aab740eb5f146d0bbc073185aa726cb')
      : content.includes('Side Accordion Layout') ? viewerUrl('mapseries', '77245a2c7bb540878fd3b24ebd048b20')
        : content.includes('Story Map Spyglass') ? viewerUrl('swipe', '97ae55e015774b7ea89fd0a52ca551c2') : null;
    if (!sample) return block;
    return opening + content.replace(/(<a\b[^>]*href=")[^"]*("[^>]*>\s*View Sample\s*<\/a>)/gi, `$1${sample}$2`) + closing;
  });
  if (html.includes('class="party-tile ')) {
    html = html.replace(/<a\b[^>]*class="party-tile ([^"]+)"[^>]*>[\s\S]*?<\/a>/g,
      (anchor, organization) => unavailableOrganizations.has(organization)
        ? `<span class="party-tile ${organization}" aria-disabled="true">${organizationLabels[organization]} (Unavailable)</span>`
        : anchor);
    html = html.replace(/(<a\b[^>]*class="party-tile ([^"]+)"[^>]*>)\s*(<\/a>)/g,
      (anchor, opening, organization, closing) => organizationLabels[organization]
        ? opening + organizationLabels[organization] + closing : anchor);
    const stylesheet = '/viewers/assets/css/archive/organization-tiles.css';
    if (!html.includes(stylesheet)) {
      html = html.replace('</head>', `<link rel="stylesheet" href="${stylesheet}">\n</head>`);
    }
  }
  writeFileSync(file, html);
}
