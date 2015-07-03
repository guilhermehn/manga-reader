class MenuItemComponent extends React.Component {
  render () {
    var selected = this.props.selected;
    var url = selected ? '#' : this.props.link;

    console.log(this.props);

    return (
      <li className={selected ? 'selected' : ''}>
        <a href='#'><i className={`zmdi zmd-lg ${this.props.iconClassname}`}></i>{this.props.title}</a>
      </li>
    );
  }
}

class MenuComponent extends React.Component {
  render () {
    var items = this.props.items.map((item, i) => {
      return <MenuItemComponent selected={item.name === item.selected} key={i} {...item} />;
    });

    return <ul>{items}</ul>;
  }
}

function RenderMenu (mountPoint, options) {
  let defaults = {
    showDevOptions: false
  };

  let settings = Object.assign({}, defaults, options);

  let items = [
    {
      route: '/views/search.html',
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
      link: '/views/options.html',
      title: 'Options',
      iconClassname: 'zmdi-settings'
    },
    {
      route: '/views/importexport.html',
      title: 'Help',
      iconClassname: 'zmdi-help'
    }
  ];

  if (settings.showDevOptions) {
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

  React.render(<MenuComponent items={items} />, document.querySelector(mountPoint));
}
