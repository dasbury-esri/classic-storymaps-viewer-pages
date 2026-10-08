(function () {
  'use strict';

  var socialHosts = /(^|\.)(?:(?:twitter|x|facebook|instagram|linkedin|pinterest|tiktok|youtube|flickr)\.com|threads\.net|bsky\.app|youtu\.be)$/;
  var controls = '.share_facebook, .share_twitter, .embed-share-facebook, .embed-share-twitter, .icon-facebook, .icon-twitter';
  var blocked = new WeakSet();
  var viewerBase = document.currentScript ? new URL('../../', document.currentScript.src).pathname : null;
  var retiredStories = {
    '7a0c165e7b404073b686f95ef98d6241': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    '9557972486744ff18cd320d83ded9956': ['nation.maps.arcgis.com', '/apps/MapSeries/index.html', 'mapseries'],
    '954145df6cf84e2d8bbea996438c99fb': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    'a644a02894d246b59ecad16fae25b767': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    '5cd671a4cf1844b7854220979574b927': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    'c4ed68ecb9d54d398dbf46dcde881471': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    'ce96fb7949fb49539345cbcfa084d425': ['nation.maps.arcgis.com', '/apps/Cascade/index.html', 'cascade'],
    '734842b0043445eaaa9a2305d43c38b4': ['story.maps.arcgis.com', '/apps/StoryMapCrowdsource/index.html', 'crowdsource']
  };
  var stylesheet = document.createElement('style');
  stylesheet.textContent = controls + ', [data-classic-social-control] { display: none !important; }';
  document.head.appendChild(stylesheet);

  function clean(root) {
    if (!root.querySelectorAll) return;
    var elements = Array.from(root.querySelectorAll('a[href], ' + controls));
    if (root.matches && root.matches('a[href], ' + controls)) elements.unshift(root);
    elements.forEach(function (element) {
      if (element.matches(controls)) {
        var control = element.closest('button, a, [role="button"], .btn') || element;
        control.setAttribute('data-classic-social-control', '');
        control.style.setProperty('display', 'none', 'important');
        control.setAttribute('aria-hidden', 'true');
        control.setAttribute('tabindex', '-1');
        blocked.add(control);
      }
      if (!element.matches('a[href]')) return;
      var destination;
      try {
        destination = new URL(element.getAttribute('href'), document.baseURI);
      } catch (error) {
        return;
      }
      var retired = retiredStories[destination.searchParams.get('appid')];
      if (viewerBase && retired && /^https?:$/.test(destination.protocol)
        && destination.hostname === retired[0] && destination.pathname === retired[1]) {
        element.setAttribute('href', viewerBase + retired[2] + '/index.html' + destination.search + destination.hash);
        element.setAttribute('rel', 'noopener noreferrer');
      }
      var myStories = /^My\s+Stories$/i.test(element.textContent.trim())
        || /(?:^|\/)en__my-stories\.html$/.test(destination.pathname)
        || ((/^storymaps(?:-classic)?\.(?:arcgis|esri)\.com$/.test(destination.hostname)
          || destination.origin === new URL(document.baseURI).origin)
          && /(?:^|\/)my-stories\/?$/.test(destination.pathname));
      if (!myStories && /^https?:$/.test(destination.protocol)
        && /^(?:www\.)?(?:crossingtherubicon|crossingtherubikhan)\.com$/.test(destination.hostname)) {
        element.setAttribute('href', 'https://web.archive.org/web/20171023101933/http://crossingtherubikhan.com/');
        element.setAttribute('rel', 'noopener noreferrer');
      }
      if (!myStories && /^https?:$/.test(destination.protocol)
        && (destination.hostname === 'storymaps-classic.arcgis.com'
          || (destination.hostname === 'storymaps.arcgis.com'
            && /^\/en\/(?:app-list(?:\/cascade)?|gallery)\/?$/.test(destination.pathname)))) {
        element.setAttribute('href', 'https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/classic');
        element.setAttribute('rel', 'noopener noreferrer');
      }
      if (!socialHosts.test(destination.hostname) && !myStories) return;
      blocked.add(element);
      element.removeAttribute('href');
      element.removeAttribute('target');
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
    });
  }

  document.addEventListener('click', function (event) {
    var element = event.target;
    while (element && element !== document) {
      if (blocked.has(element)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      element = element.parentNode;
    }
  }, true);

  new MutationObserver(function (changes) {
    changes.forEach(function (change) {
      if (change.type === 'attributes') clean(change.target);
      else change.addedNodes.forEach(clean);
    });
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'class']
  });
  clean(document);
}());
