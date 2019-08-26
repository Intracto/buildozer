<p align="center">
  <img src="https://raw.githubusercontent.com/MartijnCuppens/buildozer/develop/.github/buildozer.svg?sanitize=true" alt="Buildozer logo">
</p>

Buildozer is a simple build system to compile Sass and minify images, SVGs or javascript that works out of the box.

## Installation

### Local

```shell
# With npm
npm i buildozer

# Or install with yarn
yarn add buildozer
```

Once installed, scripts can be added to your `package.json`:

```json
"scripts" : {
  "build": "buildozer build",
  "watch": "buildozer watch"
}
```

Now `npm run build` or `npm run watch` can be executed to compile everything. If you're using `yarn`, you don't need to add scripts to your package file because you can just run `yarn buildozer build`.

### Global

If you want to use the commands globally, add the `-g` parameter:

```shell
npm i buildozer -g
```

Now you can use `buildozer build` to compile.

## Commands

### Build

```shell
buildozer build
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
buildozer watch
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
buildozer img
```

Only run css related tasks:
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Minifies the css output

### Img

```shell
buildozer img
```

Only run image related tasks:
- Minifies images and svg

### JS

```shell
buildozer js
```

Only run javascript related tasks:
- Compiles ES6 to ES5
- Minifies js

### Clean

```shell
buildozer clean
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

## Using your own folder structure

Buildozer uses a `.buildozerrc` configuration file which uses the yaml syntax and defines which paths are used. By default, this file looks like this:

```yaml
scss:
  - src: scss/**/*.scss
    dest: dest/css
img:
  - src: img/**/*.{png,jpg,jpeg,gif,svg}
    dest: dest/img
js:
  - src: js/**/*.js
    dest: dest/js
```

If you want to configure your own paths, you can run `buildozer config` to generate a `.buildozerrc` in your folder and change the paths however you like.

## Thanks

[![Intracto](https://raw.githubusercontent.com/MartijnCuppens/buildozer/develop/.github/intracto.svg?sanitize=true)](https://www.intracto.com/?utm_source=github&utm_campaign=buildozer).
