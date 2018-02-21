import makeActions from './actions';
import makeStateStream from './state';
import makeViewStream from './view';
import makeSideEffects from './sideeffects';

const actions = makeActions(window, window.document.getElementById('app'));
const state = makeStateStream(actions);
const view = makeViewStream(state);

makeSideEffects(window, state, actions, view);
