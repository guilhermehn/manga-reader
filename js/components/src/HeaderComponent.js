class HeaderComponent extends React.Component {
  render () {
    return <header>
      <div className='logo'></div>
      <h1>All Mangas Reader</h1>
    </header>;
  }
}

function createHeader (opts) {
  var defaults = {
    mountPointId: 'menunav'
  };

  var options = _.assign(defaults, typeof opts !== 'undefined' ? opts : {});

  React.render(<HeaderComponent options={options} />, document.getElementById(options.mountPointId));
}

window.createHeader = createHeader;
