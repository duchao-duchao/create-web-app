import { useDispatch, useSelector } from 'react-redux';
import { increment } from '../store/store';

export default function ReduxCounter() {
  const dispatch = useDispatch();
  const value = useSelector((state) => state.counter.value);

  return (
    <section className="card">
      <h2>Redux Demo</h2>
      <p>当前计数：{value}</p>
      <button onClick={() => dispatch(increment())}>＋1</button>
    </section>
  );
}