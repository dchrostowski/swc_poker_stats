import logo from './logo.svg';
import './App.css';

import { Provider } from 'react-redux';
import Standings from './components/standings'
import createStore from './reducers/store'

const store = createStore()

function App(props) {
  console.log(props.tournamentData)

  return (
    <Provider store={store}>
    <Standings/>

    </Provider>
  );
}

export default App
