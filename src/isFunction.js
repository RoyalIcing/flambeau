export default function isFunction(something) {
  return (typeof something === 'function') || (Object.prototype.toString.call(something) === `[object Function]`);
}
