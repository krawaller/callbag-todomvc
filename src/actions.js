import fromDelegatedEvent from 'callbag-from-delegated-event';
import fromEvent from 'callbag-from-event';
import pipe from 'callbag-pipe';
import map from 'callbag-map';
import mapTo from 'callbag-map-to';
import filter from 'callbag-filter';
import merge from 'callbag-merge';
import mergeWith from 'callbag-merge-with';
import share from 'callbag-share';

const nOfLi = node => {
  const li = node.closest('li');
  return Array.from(li.parentElement.children).indexOf(li);
};

export default function makeActions(window, root){

  const loadEvents = fromEvent(window, 'load');

  const initActions = pipe(
    loadEvents,
    mapTo(({type: 'INIT'}))
  );

  const hashActions = pipe(
    merge(loadEvents, fromEvent(window, 'hashchange')),
    map(e => ({type: 'HASH', value: e.target.location.hash.replace(/^#\//,'')}))
  );

  const editNameActions = pipe(
    fromDelegatedEvent(root, '.edit', 'change'),
    map(e => ({type: 'CHANGEEDITNAME', value: e.target.value}))
  );

  const newNameActions = pipe(
    fromDelegatedEvent(root, '.new-todo', 'change'),
    map(e => e.target.value),
    map(v => ({type: 'NEWNAME', value: v}))
  );

  const deleteActions = pipe(
    fromDelegatedEvent(root, '.destroy', 'click'),
    map(e => ({type: 'DELETETODO', idx: nOfLi(e.target)})),
    share
  );

  const toggleAllActions = pipe(
    fromDelegatedEvent(root, '.toggle-all', 'click'),
    mapTo({type: 'TOGGLEALL'})
  );
  
  const toggleTodoActions = pipe(
    fromDelegatedEvent(root, '.toggle', 'click'),
    map(e => ({type: 'TOGGLETODO', idx: nOfLi(e.target)})),
  );

  const editActions = pipe(
    fromDelegatedEvent(root, '.todo-list > li', 'dblclick', true),
    filter(e => !e.target.matches('[type=checkbox]')),
    map(e => ({type: 'EDIT', idx: nOfLi(e.target)})),
  );

  const confirmEditActions = pipe(
    fromDelegatedEvent(root, '.edit', 'keyup'),
    filter(e => e.key === 'Enter'),
    map(e => ({type: 'CONFIRMEDIT', idx: nOfLi(e.target)})),
  );

  const cancelEditActions = pipe(
    fromDelegatedEvent(root, 'input.edit', 'focusout'),
    mergeWith(pipe(
      fromDelegatedEvent(root, 'input.edit', 'keyup'),
      filter(e => e.key === 'Escape')
    )),
    mapTo({type: 'CANCELEDIT'})
  );

  const newTodoActions = pipe(
    fromDelegatedEvent(root, '.new-todo', 'keyup'),
    filter(e => e.key === 'Enter'),
    mapTo({type: 'NEWTODO'}),
  );

  const clearCompletedActions = pipe(
    fromDelegatedEvent(root, '.clear-completed', 'click'),
    mapTo({type: 'CLEARCOMPLETED'})
  );

  const allActions = merge(
    initActions, newTodoActions, newNameActions, deleteActions, toggleTodoActions,
    toggleAllActions, editActions, cancelEditActions, editNameActions,
    confirmEditActions, clearCompletedActions, hashActions
  );

  return {
    initActions, newTodoActions, newNameActions, deleteActions, toggleTodoActions,
    toggleAllActions, editActions, cancelEditActions, editNameActions,
    confirmEditActions, clearCompletedActions, hashActions, allActions
  };
}
