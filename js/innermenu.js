var menusAMR = [
  {
    name: 'options',
    link: '/views/options.html',
    title: 'Options',
    icon: 'options.png'
  },
  {
    name: 'search',
    link: '/views/search.html',
    title: 'Search',
    icon: 'find.png'
  },
  {
    name: 'bookmarks',
    link: '/views/bookmarks.html',
    title: 'Bookmarks',
    icon: 'bookmark.png'
  },
  {
    name: 'stats',
    link: '/views/pstat.html',
    title: 'My stats',
    icon: 'pstat.png'
  },
  {
    name: 'impexp',
    link: '/views/importexport.html',
    title: 'Import/Export',
    icon: 'importexport.png'
  },
  {
    name: 'faq',
    link: '/views/faq.html',
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
    link: '/views/dev.html',
    title: 'Development',
    icon: 'code.png'
  },
  {
    name: 'lab',
    link: '/views/lab.html',
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

function loadMenu (current) {
  chrome.runtime.sendMessage({
    action: 'parameters'
  }, function (response) {
    var $menu = $('#menuitems ul');
    $menu.empty();

    menusAMR.forEach(function (menu) {
      if (!menu.cond || menu.cond === 'lab' || response.dev !== 1) {
        var li = $('<li></li>');

        if (menu.name === current) {
          li
            .addClass('selected')
            .text(menu.title);
        }
        else {
          li.append('<a href=\'' + menu.link + '\'>' + menu.title + '</a>');
        }

        $menu.append(li);
      }
    });
  });
}
