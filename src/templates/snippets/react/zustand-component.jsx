import { useCounter } from '../store/useCounter';

export default function ZustandCounter() {
  const { count, inc } = useCounter();

  return (
    <section className="card">
      <h2>Zustand Demo</h2>
      <p>当前计数：{count}</p>
      <button onClick={inc}>＋1</button>
    </section>
  );
}