import axios from 'axios'

import {GET_TOURNAMENT_DATA} from './constants'

export function get_tournament_data() {
    const request = axios.get('https://api.dev.proxycrawler.com/swc_tournament_standings')
    return {
        type: GET_TOURNAMENT_DATA,
        payload: request
    }

}