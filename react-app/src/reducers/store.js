import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { composeWithDevTools } from 'redux-devtools-extension';
// import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from '../middleware/logger';
import rootReducer from './index';

//preloaded store is usually null. It's used to rehydrate the reudx state. Example persisting the redux data.
export default function configureStore(preloadedState) {
  //put prod middlewares here
  const middlewares = [thunkMiddleware, promiseMiddleware];
  if (process.env.NODE_ENV !== 'production' && module.hot) {
    //push dev middlewares here
    middlewares.push(loggerMiddleware);
  }
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers =
    composeWithDevTools(...enhancers) || compose(...enhancers); //dont need DevTools in production

  const store = createStore(rootReducer, preloadedState, composedEnhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./index', () => store.replaceReducer(rootReducer));
  }

  return store;
}
