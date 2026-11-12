# APLang

Its a language!!!

To make this work, write some code in the `code/main.apl` file!

Does require a module!! use `npm install prompt-sync`  


## Here is syntaxing!  
note on the color styling: im stealing the javascript styling, which is *similar* to this language's, but some things wont quite work.

For loops:  
```js
for(let i = 0; i < 10; i += 1){ Code Here! }
``` 

While loops:  
```js
while(var < 10 && a != 'fish'){ Code Here! }
```

IF - Elif - Else Statments:
```js
if(fruit == 'apple'){ Code Here! }
elif(fruit == 'spaghetti') { Code Here! }
else{ Code Here! }
```

Functions:  
```js
func anti() { Code Here! }
func wow(a, b) -> a + b / 2;
```

Variables:
```js
let aString = 'app' + "le";
let anInt = 12, anFloat = 3.14;
let anObject = {
  pear: 'fruit',
  keep: true,
  floaty: anInt + anFloat,
};
aString = 'pear' // NOTE!!! There is no semicolon after the variable re-assignment!!
let aList = ['woops', 'please', anObject[aString], anObject.keep];
```

Built In Variables / Functions:
 - `print(args: any[]): void` - Prints `args` to the console, seperated by spaces
 - `input(args: any[]): string` - Prints `args` to the console, seperated by spaces. Returns a string input from the console.
---
 - `Math.floor(n: number): number` - Returns the **floor** of `n`
 - `Math.ceil(n: number): number` - Returns the **ceil** of `n`
 - `Math.min(n1: number, n2: number): number` - Returns the **min** between `n1` and `n2`
 - `Math.max(n1: number, n2: number): number` - Returns the **max** between `n1` and `n2`
 - `Math.abs(n: number): number` - Returns the **absolute value** of `n`
 - `Math.sqrt(n: number): number` - Returns the **square root** of `n`
 - `Math.root(nth_root: number, n: number): number` - Returns the **nth root** of `n`
 - `Math.frac(n: number): number` - Returns the **Decimal Portion** of `n`
 - `Math.round(n: number): number` - Returns the **Round** of `n`
 - `Math.round(n: number, n_places: number): number` - Returns the **Round** of `n` to `n_places` decimal places
 - `Math.PI: number` - Returns the JavaScript value of `Math.PI`
---
 - `Rand.random(): number` - Returns a random number between 0 and 1. Uses JavaScript's `Math.random()`
 - `Rand.random(n: number): number` - Returns a random number between 0 and `n`. Uses JavaScript's `Math.random()`
 - `Rand.random(min: number, max: number): number` - Returns a random number between `min` and `max`. Uses JavaScript's `Math.random()`
 - `Rand.randint(min: number, max: number): number` - Returns a random **integer** between `min` and `max`. Uses JavaScript's `Math.random()`
 - `Rand.choice(list: any[]): any` - Returns a random value from `list`
---
Note: This stuff *technially* works, but no display has actually been set up, so it doesn't render anything.  
 - `Screen.fill(r: number, b: number?, g: number?, a: number?): void` - Sets the current color to be RGBA(`r`, `g`, `b`, `a`). Im gonna make an explanation for this thats better to explain how the not use works
 - `Screen.background(r: number, b: number?, g: number?, a: number?): void` - Sets the display background to be RGBA(`r`, `g`, `b`, `a`).
 - `Screen.rect(x: number, y: number, w: number, h: number?): void` - Places a rectangle at `(x, y)` with a width of `w` and height of `h`. If `h` is not supplied, it is replaced with `w`.
 - `Screen.ellipse(x: number, y: number, w: number, h: number?): void` - Places a ellipse at `(x, y)` with a horizontal radius (width) of `w` and vertical radius (height) of `h`. If `h` is not supplied, it is replaced with `w`.
 - `Screen.draw(): void` - Renders everything and clears all items placed on screen.
