try {
  exec('echo 1');
  exec('exit 1');
}
catch (reason) {
  echo(`2`);
}
await new Promise((resolve) => setTimeout(() => {
  console.log(3);
  resolve();
}, 500));
console.log(4);
