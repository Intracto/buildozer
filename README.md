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
- Copy files [if needed](#copy)
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Minifies the css output
- Minifies images and svg
- Compiles ES6 to ES5
- Minifies javascript
- Concatenate `.js` files in the `concat` folder 

### Watch

```shell
buildozer watch
```

The watch task will watch the source files for changes and rebuild a task when a change is detected:
- Copy files [if needed](#copy)
- Clean all dest folders
- Compiles Sass to css
- Use autoprefix for vendor prefixing
- Add scss sourcemaps
- Minifies images and svg
- Compiles ES6 to ES5
- Concatenate `.js` files in the `concat` folder

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
│   ├── concat
│   │   └── …
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
    │   ├── all.js
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
js-concat:
  - src: js/concat/*.js
    name: all.js
    dest: dest/js
svg-sprite:
  - src: img/sprite/*.svg
    name: sprite.svg
    dest: dest/img/sprite
```

If you want to configure your own paths, you can run `buildozer config` to generate a `.buildozerrc` in your folder and change the paths however you like. All `src` paths are prefixed `src_base_path`, the `dest` paths are prefixed with `dest_base_path`.

## Concat

If you want to combine multiple `.js` files into one file, you can drop the files in `js/concat` and buildozer will combine them all into a single `all.js` file. The files themselves are also compiled to the destination folder for whenever they need to be used stand alone.

## SVG sprites

You can combine the `<svg>`s you use into one sprite. Just drop the files in the `img/sprite` folder and the sprite will be generated as `dest/img/sprite/sprite.svg`.

## RFS

The [RFS](https://github.com/twbs/rfs) PostCSS plugin is included by default which allows you to use the `rfs()` function in your Sass.

## Copy

Additionally files can be copied before if needed. Useful whenever you need some files from the `node_modules` folder which you don't have available on production.

```yaml
copy:
  - src: node_modules/jquery/dist/jquery.min.js
    dest: js/vendor
  - src: node_modules/bootstrap/dist/js/bootstrap.min.js
    dest: js/vendor
```

## Thanks

Thanks [Intracto](https://www.intracto.com/?utm_source=github&utm_campaign=buildozer) for development maintenance & [icons8](https://www.icons8.com/?utm_source=github&utm_campaign=buildozer) for providing a logo.
