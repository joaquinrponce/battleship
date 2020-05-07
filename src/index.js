import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Test extends React.Component {
  render () {
    return ( 
      <div>Hello World</div>
    )
}
}

ReactDOM.render(
  <Test />,
  document.getElementById('root')
)