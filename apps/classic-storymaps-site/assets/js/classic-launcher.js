(function() {
  'use strict';
  var config = window.ClassicStoryMapsConfig;
  var form = document.getElementById('launch-form');
  if (!config || !form) return;
  var runtime = form.getAttribute('data-classic-runtime');
  var app = config.catalogApps.find(function(candidate) { return candidate.runtime === runtime; });
  var examples = config.exampleStoriesByRuntime[runtime];
  var panel = form.closest('.panel');
  if (!app || !examples || !panel) return;
  var main = panel.parentElement;

  function element(tag, className, text) {
    var node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  main.classList.add('launcher-page');
  var nav = element('nav', 'launcher-nav');
  nav.setAttribute('aria-label', 'Launcher navigation');
  var back = element('a', 'text-link', 'Back to Viewers');
  back.href = config.basePath + '/';
  nav.appendChild(back);
  var oldBack = form.querySelector('.actions .text-link');
  if (oldBack) oldBack.remove();

  var header = element('header', 'launcher-header');
  var image = element('img', 'launcher-thumbnail');
  image.src = config.basePath + '/' + app.image;
  image.alt = '';
  var copy = element('div', 'launcher-copy');
  var heading = element('h1', 'launcher-heading', app.title);
  var oldHeading = panel.querySelector('#launcher-title');
  if (oldHeading) oldHeading.remove();
  heading.id = 'launcher-title';
  copy.append(element('p', 'eyebrow', 'Classic Story Maps'), heading, element('p', 'launcher-description', app.description));
  header.append(image, copy);

  var gallery = element('section', 'launcher-examples');
  gallery.setAttribute('aria-labelledby', 'examples-heading');
  var galleryHeading = element('h2', '', 'Featured Stories');
  galleryHeading.id = 'examples-heading';
  var grid = element('div', 'launcher-example-grid');
  examples.forEach(function(story) {
    var anchor = element('a', 'launcher-example');
    anchor.href = config.runtimeViewerByApp[runtime] + '?appid=' + story.id;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    var screenshot = element('img', 'launcher-screenshot');
    screenshot.src = config.basePath + '/' + story.image;
    screenshot.alt = '';
    screenshot.loading = 'lazy';
    anchor.append(screenshot, element('h3', '', story.title));
    grid.appendChild(anchor);
  });
  gallery.append(galleryHeading, grid);
  var advanced = element('details', 'launcher-advanced');
  advanced.id = 'advanced-tools';
  advanced.appendChild(element('summary', '', 'Advanced tools'));
  main.prepend(nav, header, gallery, advanced);
  advanced.appendChild(panel);
  var oldEyebrow = panel.querySelector('.eyebrow');
  if (oldEyebrow) oldEyebrow.remove();
})();
