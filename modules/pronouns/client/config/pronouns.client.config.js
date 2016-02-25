'use strict';

// Configuring the pronouns module
angular.module('pronouns').run(['Menus',
  function (Menus) {
    // Add the pronouns dropdown item
    Menus.addMenuItem('topbar', {
      title: 'pronouns',
      state: 'pronouns',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'pronouns', {
      title: 'List pronouns',
      state: 'pronouns.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'pronouns', {
      title: 'Create pronouns',
      state: 'pronouns.create',
      roles: ['user']
    });
  }
]);
