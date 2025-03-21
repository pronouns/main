'use strict';

// Configuring the pronouns module
angular.module('pronouns').run(['Menus',
  function (Menus) {
    // Add the pronouns dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Pronouns',
      state: 'pronouns.update',
      roles: ['user']
    });

    // Add the dropdown list item
    /*Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'Public pronouns',
      state: 'pronouns.list.all'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'Private pronouns',
      state: 'pronouns.list.mine',
      roles: ['user']
    });*/
  }
]);
