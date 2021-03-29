import { combineReducers } from 'redux';
import { 
  get_tournament_data
} from './reducers'

export default combineReducers({
  tournament_data: get_tournament_data
});
