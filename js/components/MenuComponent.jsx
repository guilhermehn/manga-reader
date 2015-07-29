class MenuItemComponent extends React.Component {
  render () {
    let {selected, route, iconClassname, title} = this.props;
    let url = selected ? '#' : `#/${route}`;

    return (
      <li className={selected ? 'selected' : ''}>
        <a href={url}><i className={`zmdi zmd-lg ${iconClassname}`}></i>{title}</a>
      </li>
    );
  }
}

class MenuComponent extends React.Component {
  state: {
    actualRoute: 'search'
  }

  render () {
    let items = [
      {
        route: 'search',
        title: 'Search',
        iconClassname: 'zmdi-search'
      },
      {
        route: '/views/bookmarks.html',
        title: 'Bookmarks',
        iconClassname: 'zmdi-bookmark'
      },
      {
        route: '/views/importexport.html',
        title: 'Import/Export',
        iconClassname: 'zmdi-import-export'
      },
      {
        route: 'settings',
        title: 'Settings',
        iconClassname: 'zmdi-settings'
      },
      {
        route: '/views/importexport.html',
        title: 'Help',
        iconClassname: 'zmdi-help'
      }
    ];

    if (MR.settings.showDevOptions) {
      let devItems = [
        {
          route: '/views/lab.html',
          title: 'Lab',
          iconClassname: 'zmdi-developer-board'
        },
        {
          route: '/views/dev.html',
          title: 'Development',
          iconClassname: 'zmdi-code'
        },
        {
          route: 'http://wiki.allmangasreader.com/changelog',
          title: 'Changelog',
          iconClassname: 'zmdi-info'
        }
      ];

      devItems.forEach((item) => {
        items.push(item);
      });
    }

    let menuItems = items.map((item, i) => {
      return <MenuItemComponent selected={item.route === item.actualRoute} key={i} {...item} />;
    });

    return <ul>{menuItems}</ul>;
  }
}

MR.Components.register('MenuComponent', <MenuComponent />);
