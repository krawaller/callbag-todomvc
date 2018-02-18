import Snabbdom from 'snabbdom-pragma';

import pipe from 'callbag-pipe';
import map from 'callbag-map';

export default function makeViewStream(state){
  return pipe(
    state,
    map(s => (
      <div>
        <section className="todoapp">
          <header className="header">
            <h1>todos</h1>
            <input className="new-todo" value={s.newName} placeholder="What needs to be done?"/>
          </header>
          <section className="main">
            {s.todos.length > 0 && (
              <div>
                <input id="toggle-all" className="toggle-all" type="checkbox" checked={!s.remaining}/>
                <label for="toggle-all">Mark all as complete</label>
              </div>
            )}
            <ul className="todo-list">
              {s.todos.map((t,n) => (s.filter === 'all' || (s.filter === 'completed' && t.done) || (s.filter === 'active' && !t.done)) && (
                <li key={n} class={{completed: t.done, editing: t.editing}}>
                  <div className="view">
                    <input className="toggle" type="checkbox" checked={t.done}/>
                    <label>{t.text}</label>
                    <button className='destroy'></button>
                  </div>
                  <input className="edit" value={s.editText} />
                </li>
              ))}
            </ul>
            {s.todos.length > 0 && (
              <footer className="footer">
                <span className="todo-count"><strong>{s.remaining}</strong> item{s.remaining !== 1 && 's'} left</span>
                <ul className="filters">
                  <li>
                    <a class={{selected: s.filter === 'all'}} href="#/">All</a>
                  </li>
                  <li>
                    <a class={{selected: s.filter === 'active'}} href="#/active">Active</a>
                  </li>
                  <li>
                    <a class={{selected: s.filter === 'completed'}} href="#/completed">Completed</a>
                  </li>
                </ul>
                <button className="clear-completed">Clear completed</button>
              </footer>
            )}
          </section>
        </section>
        <footer className="info">
          <p>Double-click to edit a todo</p>
          <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
          <p>Created by <a href="http://blog.krawaller.se">David Waller</a></p>
          <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
      </div>
    ))
  );
}
