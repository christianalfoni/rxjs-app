import {dispatch, actionEffect, init} from 'rxjs-app';
import { Observable } from 'rxjs';

const SOMETHING_ELSE = 'SOMETHING_ELSE';
const LOAD_TODO = 'LOAD_TODO';
const LOADED_TODO = 'LOADED_TODO';
const LOAD_TODO_ERROR = 'LOAD_TODO_ERROR';
const LAST_ACTION = 'LAST_ACTION';

function reducerA(state = { isLoading: false }, action) {
  switch (action.type) {
  case LOAD_TODO:
    return { ...state, isLoading: true };
  case LOADED_TODO:
    return { ...state, isLoading: false, todos: action.todos };
  default:
    return state;
  }
}

const getTodos = actionEffect(LOAD_TODO)
  .delay(1000)
  .map(() => { JSON.parse({}) })
  .catch((e) => Observable.of({ type: LOAD_TODO_ERROR, message: e.message }))

const otherEffect = actionEffect(LOAD_TODO_ERROR)
  .delay(2000)
  .map(action => ({type: LAST_ACTION}));

const state = init({
  reducers: {
    reducerA
  },
  effects: {
    getTodos, otherEffect
  }
});

state.subscribe(() => {

});

dispatch(LOAD_TODO);
dispatch(SOMETHING_ELSE);
