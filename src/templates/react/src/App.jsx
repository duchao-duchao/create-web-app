import './App.css';

export default function App() {
  return (
    <main className="container">
      <h1>React App</h1>
      <p>通过 create-web-app 自研模版创建。</p>
      <div className="card">
        <p>你可以自由扩展插件：</p>
        <ul>
          <li>Router</li>
          <li>Zustand / Redux</li>
          <li>ESLint / Prettier</li>
        </ul>
        {/* PLUGIN_SLOT */}
      </div>
    </main>
  );
}
