func makeAdder (offset) {

  func add (x, y) -> x + y + (offset);


  ret add;
}

for(let i = 0; i < 3; i=i+1){
    const adder = makeAdder(i, 0);
    print('12 + 5 + i =', adder(12, 5), 'i:',i)
    print('i:', i)
}
const adder = makeAdder(1);

print(adder(5,6))
print(makeAdder()(10, 2))
print(makeAdder()(2,3))