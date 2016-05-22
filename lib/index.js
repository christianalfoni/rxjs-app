import {Subject} from 'rxjs';

function hashCode(string) {
    var hash = 0;
    if (string.length == 0) return hash;
    for (var i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function intToHSL(number) {
    var shortened = number % 360;
    return "hsl(" + shortened + ",50%,30%)";
}

function createStore(reducers) {
  return {
    reducer(currentState, action) {
      return Object.keys(reducers).reduce((stateAction, key) => {
        const existingState = stateAction.state[key];
        const newState = reducers[key](existingState, stateAction.action);
        if (existingState !== newState) {
          return {...stateAction, state: {...stateAction.state, [key]: newState}};
        }
        return stateAction;
      }, {
        ...currentState,
        action
      });
    },
    initialState: {
      action: {},
      state: Object.keys(reducers).reduce((state, key) => {
        state[key] = reducers[key](undefined, {});
        return state;
      }, {})
    }
  };
}

const actions = new Subject();
const effectsStream = new Subject();

export function actionEffect() {
  const effectTypes = [].slice.call(arguments);
  const createdEffect = effectsStream.filter(action => effectTypes.indexOf(action.type) >= 0);
  createdEffect.subscribe(action => {
    console.log('%c'  + action.type + '%c triggered an effect ', 'font-size: 12px; color: ' + intToHSL(hashCode(action.type)) + ';', 'color: #333');
  });
  return createdEffect;
}

export function dispatch(type, payload) {
  actions.next({...payload, type});
}

export function init({reducers = {}, effects = {}}) {
  const store = createStore(reducers);
  const reduced = actions
    .scan(store.reducer, store.initialState);

  // Debugging
  actions.subscribe(action => {
    console.log('%c' + action.type + '%c changing state ', 'font-size: 12px; color: ' + intToHSL(hashCode(action.type)) + ';', 'color: #333');
  });

  let prevState = store.initialState.state;
  reduced.subscribe(({state}) => {
    const changes = Object.keys(prevState).reduce((changes, key) => {
      if (prevState[key] !== state[key]) {
        changes.push(key);
      }
      return changes;
    }, []);
    prevState = state;
    console.log('%c' + (changes.length ? 'Changes in: ' + changes.join(', ') : 'No change'), 'font-size: 12px;');
    console.log(state);
  });

  Object.keys(effects).forEach(key => {
    effects[key].subscribe(action => {
      console.log('%c'  + action.type + '%c returned from effect ' + '%c' + key, 'font-size: 12px; color: ' + intToHSL(hashCode(action.type)) + ';', 'color: #333', 'font-weight: bold');
      actions.next(action);
    }, (err) => {
      console.log('%c✖ ' + '%c Uncaught error in effect ' + '%c' + key, 'font-size: 12px; color: red;', 'color: #333', 'font-weight: bold');
      throw err;
    });
  });

  return reduced.map(stateAndAction => {
    effectsStream.next({
      ...stateAndAction.action,
      state: stateAndAction.state
    });
    console.log('-----------------------------------------------');
    return stateAndAction.state;
  });
}
