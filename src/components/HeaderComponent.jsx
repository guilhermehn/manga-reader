class HeaderComponent extends React.Component {
  render () {
    return <h1><i className='zmdi zmdi-book zmd-lg'></i> Manga Reader</h1>;
  }
}

MR.Components.register('HeaderComponent', <HeaderComponent />);
