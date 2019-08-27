<p align="center">
  <img src="https://raw.githubusercontent.com/MartijnCuppens/buildozer/master/.github/buildozer.svg?sanitize=true" alt="Buildozer logo">
</p>

Buildozer is a simple build system to compile Sass, minify images or SVGs and compiles javascript that works out of the box. It's built on top of Gulp but doesn't require you to configure the setup.

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

The watch task will watch the source files for changes and rebuild a task when a change is detected:
- Clean all dest folders
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Add scss sourcemaps
- Minifies images and svg
- Compiles ES6 to ES5

### Separate tasks

`buildozer clean` is run to clear all `dest` folders. `buildozer css`, `buildozer js` and `buildozer img` can be used to run the subtasks of `buildozer build`.

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
src_base_path: ./
dest_base_path: ./
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

If you want to configure your own paths, you can run `buildozer config` to generate a `.buildozerrc` in your folder and change the paths however you like. The `src_base_path`

## Thanks

Thanks Intracto for development maintenance & icons8 for providing a logo.

[![Intracto](https://raw.githubusercontent.com/MartijnCuppens/buildozer/master/.github/intracto.svg?sanitize=true)](https://www.intracto.com/?utm_source=github&utm_campaign=buildozer) &nbsp; &nbsp; 
[![icons8](https://raw.githubusercontent.com/MartijnCuppens/buildozer/master/.github/icons8.svg?sanitize=true)](https://www.icons8.com/?utm_source=github&utm_campaign=buildozer)
