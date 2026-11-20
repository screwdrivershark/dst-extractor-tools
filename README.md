# Don't Starve Quotes Extractor

This tool takes the lua files from the Don't Starve games and extracts pieces of quotes from it and formats it for the <https://dontstarve.wiki.gg/wiki/Template:Quotes> MediaWiki template.

[speech_wilson.lua](speech_wilson.lua) is a short sample showing the structure of a speech file.

## todo

* does it properly handle that warly is the only character that doesn't have quotes for QUAGMIRE_PIGEON? should it only say "no quotes found" once or for each key?
* how does it handle line breaks in a quote? e.g. woodie for gold nugget. convert to <br>?

## Fengari (Lua in JS)

`fengari.load(src)` compiles a Lua chunk and returns a JS function; calling it runs the chunk.
The optional second argument is the chunk name used in error messages, not an environment.
All calls share one global Lua state, and the `js` module is preloaded.

### Calling Lua functions from JS

Fengari passes JS `this` as the **first Lua argument**, followed by the rest of the JS arguments:

| JS call              | Lua receives        |
| -------------------- | ------------------- |
| `f.call(a)`          | `function(a)`       |
| `f.call(a, b, c)`    | `function(a, b, c)` |
| `f.apply(a, [b, c])` | `function(a, b, c)` |
| `f(a)`               | `function(nil)`     |
| `f.invoke(a, [b])`   | `function(a, b)`, returns all Lua return values as an array |

So a Lua `function(s)` is called as `f.call(s)`, not `f(s)`.

### Return values

| Lua value returned      | JS value returned                                  |
| ----------------------- | -------------------------------------------------- |
| string / number / boolean | string / number / boolean                        |
| table                   | callable wrapper: use `.get(key)`, `.set`, `.invoke` |
| `nil`                   | `undefined`                                        |

A Lua table is not a plain JS object — `t.FOO` is `undefined`; use `t.get("FOO")`.
`getFullScript()` converts tables to real JS objects with the `js` module so normal property
access works.

Lua errors are thrown into JS as plain strings, so `error.message` is `undefined`; use `String(error)`.
