// Components global namespace
window.Components = {};
var MenuItemComponent = React.createClass({displayName: "MenuItemComponent",
  render: function () {
    var data = this.props.data;
    var selected = this.props.selected;
    var cx = selected ? 'selected' : '';
    var url = selected ? '#' : data.link;

    return React.createElement("li", {className: cx}, React.createElement("a", {href: url}, data.title));
  }
});

var MenuComponent = React.createClass({displayName: "MenuComponent",
  render: function () {
    var selected = this.props.selected;
    var items = this.props.items.map(function (item) {
      return React.createElement(MenuItemComponent, {selected: item.name === selected, data: item});
    });

    return React.createElement("ul", null, items);
  }
});

window.Components.MenuComponent = MenuComponent;
var OtherComponent = React.createClass({displayName: "OtherComponent",
  render: function () {
    return React.createElement("div", null, "Example");
  }
});

window.Components.OtherComponent = OtherComponent;
