Slik is a simple build system to compile Sass and minify images, SVGs or javascript which works out of the box.

## Installation

TODO: publish on npm

### Local

```shell
# With npm
npm i slik

# Or install with yarn
yarn add slik
```

Once installed, scripts can be added to your `package.json`:

```json
"scripts" : {
  "build": "slik build",
  "watch": "slik watch"
}
```

Now `npm run build` or `npm run watch` can be executed to compile everything. If you're using `yarn`, you don't need to add scripts to your package file because you can just run `yarn slik build`.

### Global

If you want to use the commands globally, add the `-g` parameter:

```shell
npm i slik -g
```

Now you can use `slik build` to compile everything.

## Commands

### Build

```shell
slik build
```

The build task can be used for production environments. The build command:
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Minifies the css output
- Minifies images and svg
- Compiles ES6 to ES5
- Minifies js

### Watch

```shell
slik watch
```

The watch task will watch the source files for changes and rebuild a taks when a change is detected:
- Clean all dest folders
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Add scss souremaps
- Minifies images and svg
- Compiles ES6 to ES5

### CSS

```shell
slik img
```

Only run css related tasks:
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Minifies the css output

### Img

```shell
slik img
```

Only run image related tasks:
- Minifies images and svg

### JS

```shell
slik js
```

Only run javascript related tasks:
- Compiles ES6 to ES5
- Minifies js

### Clean

```shell
slik clean
```

Clean all dest folders.


## Default folder structure

This is the default folder structure:

```text
project/
├── scss/
│   ├── main.scss
│   └── …
├── js/
│   ├── main.js
│   └── …
└── img/
    ├── loading.gif
    ├── image.jpg
    ├── logo.svg
    └── …
```

which compiles to:

```text
project/
└── dest/
    ├── css/
    │   ├── main.css
    │   └── …
    ├── js/
    │   ├── main.js
    │   └── …
    └── img/
        ├── loading.gif
        ├── image.jpg
        ├── logo.svg
        └── …
```
