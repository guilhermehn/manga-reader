var MenuItemComponent = React.createClass({
  render: function () {
    var data = this.props.data;
    var selected = this.props.selected;
    var cx = selected ? 'selected' : '';
    var url = selected ? '#' : data.link;

    return <li className={cx}><a href={url}>{data.title}</a></li>;
  }
});

var MenuComponent = React.createClass({
  render: function () {
    var selected = this.props.selected;
    var items = this.props.items.map(function (item) {
      return <MenuItemComponent selected={item.name === selected} data={item} />;
    });

    return <ul>{items}</ul>;
  }
});

window.Components.MenuComponent = MenuComponent;
