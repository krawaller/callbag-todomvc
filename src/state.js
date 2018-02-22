import pipe from 'callbag-pipe';
import scan from 'callbag-scan';

const initialState = {
  todos: [],
  newName: '',
  editText: '',
  filter: 'all',
  editing: null
};

export default function makeStateStream(actions){
  return pipe(
    actions.allActions,
    scan(augmenter(reducer), initialState),
  );
}

function updateInList(state, n, mapper){
  return state.todos.slice(0,n)
    .concat(mapper(state.todos[n],state))
    .concat(state.todos.slice(n+1));
}

function reducer(state, action){
  if (action.type === 'CONFIRMEDIT' && !state.editText){
    action.type = 'DELETETODO';
  }
  if (action.idx !== undefined && state.filter !== 'all'){
    action.idx += state.todos.filter(
      t => !t.done && state.filter === 'completed' || t.done && state.filter === 'active'
    ).length;
  }
  switch(action.type){
    case 'NEWTODO': {
      return !state.newName ? state : {
        ...state,
        todos: state.todos.concat({
          text: state.newName,
          done: false
        }),
        newName: ''
      };
    }
    case 'NEWNAME': return {...state, newName: action.value};
    case 'DELETETODO': return {
      ...state,
      todos: state.todos.slice(0,action.idx).concat(state.todos.slice(action.idx+1))
    }
    case 'TOGGLETODO': return {
      ...state,
      todos: updateInList(state, action.idx, t => ({...t, done: !t.done}))
    }
    case 'CONFIRMEDIT': return {
      ...state,
      todos: updateInList(state, action.idx, (t,s) => ({...t, text: s.editText})),
      editing: null
    }
    case 'EDIT': return {
      ...state,
      editing: action.idx,
      editText: state.todos[action.idx].text
    }
    case 'CHANGEEDITNAME': return {
      ...state,
      editText: action.value
    }
    case 'CANCELEDIT': return action.idx === state.todos.length ? state : {
      ...state,
      editing: null,
    }
    case 'TOGGLEALL': return {
      ...state,
      todos: state.todos.map(t => ({...t, done: state.remaining !== 0}))
    }
    case 'CLEARCOMPLETED': return {
      ...state,
      todos: state.todos.filter(t => !t.done)
    }
    case 'HASH': return {
      ...state,
      filter: action.value === 'completed' ? 'completed' : action.value === 'active' ? 'active' : 'all'
    }
    default: return state;
  }
}

const augmenter = reducer => (state, action) => {
  let newState = reducer(state, action);
  return {
    ...newState,
    remaining: newState.todos.filter(t => !t.done).length
  };
};
