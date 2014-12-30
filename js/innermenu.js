var menusAMR = [
  {
    name: 'options',
    link: 'options.html',
    title: 'Options',
    icon: 'options.png'
  },
  {
    name: 'search',
    link: 'search.html',
    title: 'Search',
    icon: 'find.png'
  },
  {
    name: 'bookmarks',
    link: 'bookmarks.html',
    title: 'Bookmarks',
    icon: 'bookmark.png'
  },
  {
    name: 'stats',
    link: 'pstat.html',
    title: 'My stats',
    icon: 'pstat.png'
  },
  {
    name: 'impexp',
    link: 'importexport.html',
    title: 'Import/Export',
    icon: 'importexport.png'
  },
  {
    name: 'faq',
    link: 'faq.html',
    title: 'Help',
    icon: 'infos.png'
  },
  {
    name: 'release',
    link: 'http://wiki.allmangasreader.com/changelog',
    title: 'Changelog',
    icon: 'release.png'
  },
  {
    name: 'dev',
    link: 'dev.html',
    title: 'Development',
    icon: 'code.png'
  },
  {
    name: 'lab',
    link: 'lab.html',
    title: 'Lab',
    cond: 'lab',
    icon: 'dev.png'
  },
  {
    name: 'home',
    link: 'http://allmangasreader.com/',
    title: 'Home',
    icon: 'home.png'
  }
];

var dispIcons = false;

function loadMenu (cur) {
  chrome.runtime.sendMessage({
    action: 'parameters'
  }, function (response) {
    var $menu = $('#menuitems ul');
    $menu.empty();

    menusAMR.forEach(function (menu) {
      if (!menu.cond || menu.cond === 'lab' || response.dev !== 1) {
        var li = $(menu.name === cur ? '<li class=\'selected\'></li>' : '<li><a href=\'' + menu.link + '\'></a></li>');

        if (dispIcons) {
          li.find('a').append('<img src=\'img/' + menu.icon + '\' title=\'' + menu.title + '\' />');
        }
        else {
          li.append(menu.title);
        }

        $menu.append(li);
      }
    });
  });
}
