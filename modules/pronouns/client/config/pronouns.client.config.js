'use strict';

// Configuring the pronouns module
angular.module('pronouns').run(['Menus',
  function (Menus) {
    // Add the pronouns dropdown item
    Menus.addMenuItem('topbar', {
      title: 'List pronouns',
      state: 'pronouns.list',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'Public pronouns',
      state: 'pronouns.list.all'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'pronouns.list', {
      title: 'My pronouns',
      state: 'pronouns.list.mine',
      roles: ['user']
    });
    Menus.addMenuItem('topbar', {
      title: 'Create pronouns',
      state: 'pronouns.create',
      roles: ['user']
    });
  }
]);
