import pipe from 'callbag-pipe';
import scan from 'callbag-scan';

const reducer = (curState, action) => {
  if (action.type === 'CONFIRMEDIT' && !curState.editText){
    action.type = 'DELETETODO';
  }
  if (action.idx !== undefined && curState.filter !== 'all'){
    action.idx += curState.todos.filter(
      t => !t.done && curState.filter === 'completed' || t.done && curState.filter === 'active'
    ).length;
  }
  switch(action.type){
    case 'NEWTODO': {
      return !curState.newName ? curState : {
        ...curState,
        todos: curState.todos.concat({
          text: curState.newName,
          editing: false,
          done: false
        }),
        newName: ''
      };
    }
    case 'NEWNAME': return {...curState, newName: action.value};
    case 'DELETETODO': return {
      ...curState,
      todos: curState.todos.slice(0,action.idx).concat(curState.todos.slice(action.idx+1))
    }
    case 'TOGGLETODO': return {
      ...curState,
      todos: curState.todos.slice(0,action.idx).concat({
        ...curState.todos[action.idx],
        done: !curState.todos[action.idx].done
      }).concat(curState.todos.slice(action.idx+1))
    }
    case 'CONFIRMEDIT': return {
      ...curState,
      todos: curState.todos.slice(0,action.idx).concat({
        ...curState.todos[action.idx],
        text: curState.editText
      }).concat(curState.todos.slice(action.idx+1))
    }
    case 'EDIT': return {
      ...curState,
      todos: curState.todos.slice(0,action.idx).concat({
        ...curState.todos[action.idx],
        editing: true,
      }).concat(curState.todos.slice(action.idx+1)),
      editText: curState.todos[action.idx].text
    }
    case 'CHANGEEDITNAME': return {
      ...curState,
      editText: action.value
    }
    case 'CANCELEDIT': return action.idx === curState.todos.length ? curState : {
      ...curState,
      todos: curState.todos.map(t => ({...t, editing: false}))
    }
    case 'TOGGLEALL': return {
      ...curState,
      todos: curState.todos.map(t => ({...t, done: curState.remaining !== 0}))
    }
    case 'CLEARCOMPLETED': return {
      ...curState,
      todos: curState.todos.filter(t => !t.done)
    }
    case 'HASH': return {
      ...curState,
      filter: action.value === 'completed' ? 'completed' : action.value === 'active' ? 'active' : 'all'
    }
    default: return curState;
  }
}

const augmenter = reducer => (curState, action) => {
  let newState = reducer(curState, action);
  return {
    ...newState,
    remaining: newState.todos.filter(t => !t.done).length
  };
};

const initialState = {
  todos: [],
  newName: '',
  editText: '',
  filter: 'all'
};

function makeStateStream(actions){
  return pipe(
    actions.allActions,
    scan(augmenter(reducer), initialState),
  );
}

export default makeStateStream;
