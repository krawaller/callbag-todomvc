import fromDelegatedEvent from 'callbag-from-delegated-event';
import fromEvent from 'callbag-from-event';
import pipe from 'callbag-pipe';
import map from 'callbag-map';
import mapTo from 'callbag-map-to';
import filter from 'callbag-filter';
import merge from 'callbag-merge';
import mergeWith from 'callbag-merge-with';
import share from 'callbag-share';
import proxy from 'callbag-proxy';
import sample from 'callbag-sample';
import latest from 'callbag-latest';
import tap from 'callbag-tap';
import sampleCombine from 'callbag-sample-combine';

const log = name => tap(v => console.log(name, v));

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

  const toggleAllActions = pipe(
    fromDelegatedEvent(root, '.toggle-all', 'click'),
    mapTo({type: 'TOGGLEALL'})
  );

  const toggleTodoActions = pipe(
    fromDelegatedEvent(root, '.toggle', 'click'),
    map(e => ({type: 'TOGGLETODO', idx: nOfLi(e.target)})),
    log("TOGGLETODO"),
  );

  const clearCompletedActions = pipe(
    fromDelegatedEvent(root, '.clear-completed', 'click'),
    mapTo({type: 'CLEARCOMPLETED'})
  );

  const cancelEditActions = pipe(
    fromDelegatedEvent(root, 'input.edit', 'focusout'),
    mergeWith(pipe(
      fromDelegatedEvent(root, 'input.edit', 'keyup'),
      filter(e => e.key === 'Escape')
    )),
    mapTo({type: 'CANCELEDIT'})
  );

  const newTodoActions_proxy = proxy();
  const newNameTypeStream = pipe(
    fromDelegatedEvent(root, '.new-todo', 'change'),
    map(e => e.target.value),
    mergeWith(pipe(
      newTodoActions_proxy,
      mapTo('')
    ))
  );

  const newTodoActions = pipe(
    fromDelegatedEvent(root, '.new-todo', 'keyup'),
    filter(e => e.key === 'Enter'),
    sample(latest(newNameTypeStream)),
    filter(v => v.length),
    map(v => ({type: 'NEWTODO', value: v})),
    share
  );
  newTodoActions_proxy.connect(newTodoActions);

  const startEditActions = pipe(
    fromDelegatedEvent(root, '.todo-list > li', 'dblclick', true),
    filter(e => !e.target.matches('[type=checkbox]')),
    map(e => ({type: 'STARTEDIT', idx: nOfLi(e.target)})),
  );

  const editTypeStream = pipe(
    fromDelegatedEvent(root, '.edit', 'change'),
    map(e => e.target.value)
  );

  const editSubmissions = pipe(
    fromDelegatedEvent(root, '.edit', 'keyup'),
    filter(e => e.key === 'Enter'),
    sampleCombine(latest(editTypeStream)),
    map(([e, v]) => ({value: v, target: e.target}))
  );

  const confirmEditActions = pipe(
    editSubmissions,
    filter(e => e.value),
    map(e => ({type: 'CONFIRMEDIT', idx: nOfLi(e.target), value: e.value})),
    share
  );

  const deleteActions = pipe(
    fromDelegatedEvent(root, '.destroy', 'click'),
    mergeWith(
      pipe(
        editSubmissions,
        filter(e => !e.value)
      )
    ),
    map(e => ({type: 'DELETETODO', idx: nOfLi(e.target)})),
    share
  );

  const allActions = share(merge(
    initActions, newTodoActions, deleteActions, toggleTodoActions,
    toggleAllActions, startEditActions, cancelEditActions,
    confirmEditActions, clearCompletedActions, hashActions
  ));

  return {
    initActions, newTodoActions, deleteActions, toggleTodoActions,
    toggleAllActions, startEditActions, cancelEditActions,
    confirmEditActions, clearCompletedActions, hashActions, allActions
  };
}
