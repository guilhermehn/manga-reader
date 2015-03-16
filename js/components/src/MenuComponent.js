class MenuItemComponent extends React.Component {
  render () {
    var selected = this.props.selected;
    var url = selected ? '#' : this.props.link;

    return <li className={selected ? 'selected' : ''}>
      <a href={url}>{this.props.title}</a>
    </li>;
  }
}

class MenuComponent extends React.Component {
  render () {
    var items = this.props.items.map((item, i) => {
      var {selected, ...other} = item;
      return <MenuItemComponent selected={item.name === selected} {...other} key={i} />;
    });

    return <ul className='menu'>{items}</ul>;
  }
}

function createNavMenu (opts) {
  var defaults = {
    mountPointId: 'menunav'
  };

  var options = _.assign(defaults, typeof opts !== 'undefined' ? opts : {});

  React.render(<MenuComponent {...options} />, document.getElementById(options.mountPointId));
}

window.createNavMenu = createNavMenu;
