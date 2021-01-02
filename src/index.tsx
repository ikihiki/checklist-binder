import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider, teamsTheme } from '@fluentui/react-northstar';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import firebase from 'firebase';

const config = {

};
firebase.initializeApp(config);


ReactDOM.render(
  <Provider theme={teamsTheme}>
    <BrowserRouter>
      <Switch>
        <Route exact path='/' component={App} />
        <Route path='/:id' component={App} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
