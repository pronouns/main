'use strict';

angular.module('core').service('Accessibility', ['Authentication',
  function (Authentication) {

    this.injectCss = function (cssId, relUrl) {
      if (!document.getElementById(cssId)) {
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = relUrl;
        link.media = 'all';
        head.appendChild(link);
      }
    };

    this.inject = function () {
      if (Authentication.user && Authentication.user.featureToggles && Authentication.user.featureToggles.indexOf('font') > -1) {
        var node = document.createElement('style');
        node.innerHTML = 'body { font-family: \'OpenDyslexic\' !important; }';
        document.body.appendChild(node);
      }
      if (Authentication.user && Authentication.user.featureToggles && Authentication.user.featureToggles.indexOf('textSize') > -1) {
        var node2 = document.createElement('style');
        node2.innerHTML = 'body,h1,h2,h3,h4,h5,p,span,button,a { font-size: ' + Authentication.user.textSize + 'px !important;}';
        document.body.appendChild(node2);

        this.injectCss('navBreak', '/nav-break.css');
      }
      if (Authentication.user && Authentication.user.featureToggles && Authentication.user.featureToggles.indexOf('contrast') > -1) {
        this.injectCss('contrastCss', '/accessibility.css');
      }
    };

  }
]);
