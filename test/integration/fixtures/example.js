try {
  sh('echo 1');
  sh('exit 1');
}
catch (reason) {
  echo('2');
}
await new Promise((resolve) => setTimeout(() => {
  console.log(3);
  resolve();
}, 500));
console.log(4);
