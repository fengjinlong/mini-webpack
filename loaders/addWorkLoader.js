export function addWorkLoader (source) {
  this.addDeps('addWorkLoader')
  // console.log(source);
  let source1 = JSON.parse(source)
  source1.work = 'farmer'
  return JSON.stringify(source1)
}