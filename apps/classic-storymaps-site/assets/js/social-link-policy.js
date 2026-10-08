(function () {
  'use strict';

  var socialHosts = /(^|\.)(?:(?:twitter|x|facebook|instagram|linkedin|pinterest|tiktok|youtube|flickr)\.com|threads\.net|bsky\.app|youtu\.be)$/;
  var controls = '.share_facebook, .share_twitter, .embed-share-facebook, .embed-share-twitter, .icon-facebook, .icon-twitter';
  var blocked = new WeakSet();
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
      if (!socialHosts.test(destination.hostname)) return;
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
