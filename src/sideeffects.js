import pipe from 'callbag-pipe';
import merge from 'callbag-merge';
import latest from 'callbag-latest';
import withPrevious from 'callbag-with-previous';
import forEach from 'callbag-for-each';
import sampleCombine from 'callbag-sample-combine';

const patch = require('snabbdom').init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/attributes').default
]);

export default function makeSideEffects(window, state, actions, view){

  pipe(
    withPrevious(view),
    forEach(([cur,prev,isFirst]) => {
      patch(isFirst ? window.document.getElementById('renderoutput') : prev, cur)
    })
  );

  pipe(
    actions.newTodoActions,
    forEach(a => window.document.querySelector(".new-todo").value = '')
  );

  pipe(
    actions.startEditActions,
    sampleCombine(latest(state)),
    forEach(([a,s]) => {
      let field = window.document.querySelector(".editing .edit");
      field.value = s.todos[a.idx].text;
      field.focus();
    })
  );

  pipe(
    merge(
      actions.initActions, actions.deleteActions, actions.confirmEditActions,
      actions.newTodoActions, actions.cancelEditActions
    ),
    forEach(a => window.document.querySelector(".new-todo").focus())
  );
}
