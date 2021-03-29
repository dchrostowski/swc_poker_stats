import {
    GET_TOURNAMENT_DATA
} from '../actions/constants'


export const get_tournament_data = (state = {}, action) => {
    switch(action.type) {
        case GET_TOURNAMENT_DATA + '_PENDING': {
            return {...state, isLoading: true, isError: false, errorMessage: null}
        }

        case GET_TOURNAMENT_DATA + '_FULFILLED': {
            return {
                ...state, 
                isLoading: false, 
                isError: false, 
                errorMessage: null, 
                data: action.payload.data}
            }
        

        case GET_TOURNAMENT_DATA + "_REJECTED": {
            return {
                ...state,
                isLoading: false,
                isError: true,
                errorMessage: "something went wrong"
            }
        }
        default: 
            return state;
    
    }
}