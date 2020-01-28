<p align="center">
  <img src="https://raw.githubusercontent.com/MartijnCuppens/buildozer/master/.github/buildozer.svg?sanitize=true" alt="Buildozer logo">
  <br>
  <br>
  <a href="https://npmjs.org/package/buildozer"><img src="https://img.shields.io/npm/v/buildozer.svg" alt="npm version"></a>
  <a href="https://github.com/Intracto/buildozer/actions"><img src="https://github.com/Intracto/buildozer/workflows/Run%20tests/badge.svg" alt="Actions status"></a>
  <img src="https://david-dm.org/Intracto/buildozer.svg" alt="Dependencies">
</p>

Buildozer is a simple build system to compile Sass, minify images or SVGs and compile javascript. It's built on top of [Gulp](https://gulpjs.com/) but doesn't require any configuration to get started.

## Installation

```shell
# With npm
npm i buildozer

# Or install with yarn
yarn add buildozer
```

Once installed, the buildozer scripts can be executed:

```shell
# Using npm's script
npx buildozer build

# Or using yarn
yarn buildozer build
```

The scripts can also be added to your `package.json` if needed:

```json
{
  "scripts" : {
    "build": "buildozer build",
    "watch": "buildozer watch"
  }
}
```

## Commands

Both the `build` and `watch` commands output the files to the same directory.

### Build

```shell
buildozer build
```

The `build` task can be used for production environments. The build command:
- Copy files [if needed](#copy)
- Compiles Sass to CSS
- Use [autoprefixer](https://github.com/postcss/autoprefixer) for vendor prefixing
- Minifies the CSS output
- Minifies images and svg
- Transpiles ES6 to ES5
- Minifies javascript
- Concatenate `.js` files in the `concat` folder 

### Watch

```shell
buildozer watch
```

The `watch` task will watch the source files for changes and rebuild a task when a change is detected:
- Copy files [if needed](#copy)
- Clean all dest folders
- Compiles Sass to CSS
- Use [autoprefixer](https://github.com/postcss/autoprefixer) for vendor prefixing
- Add scss sourcemaps
- Minifies images and svg
- Transpiles ES6 to ES5
- Concatenate `.js` files in the `concat` folder
- Run `browsersync` if configured

### Separate tasks

`buildozer clean` is run to clear all `dest` folders. `buildozer copy`, `buildozer css`, `buildozer js`, `buildozer js-concat` , `buildozer svg-sprite` and `buildozer img` can be used to run the subtasks of `buildozer build`.

## Order of script execution

- **Set environment**: Set the environment to `production` for the `build` task. This way, the assets are minified on production.
- **Clean**: Remove all files from destination folders.
- **Copy**: Copy all files defined in `copy` array.
- **CSS**: Compile CSS.
- **JS**: Compile javascript files and concat if configured.
- **Image**: Minify images & generate svg sprite if configured.

## Default folder structure

Buildozer knows what files it needs to compile because it uses a predefined folder structure:

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

&hellip; which compiles to:

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
browsersync:
  server: null # Static sites
  proxy: null # Dynamic sites
  reload: null # Glob to watch for reload
```

If you want to configure your own paths, you can run `buildozer config` to generate a `.buildozerrc` in your folder and change the paths however you like. All `src` paths are prefixed `src_base_path`, the `dest` paths are prefixed with `dest_base_path`.

## Concat

If you want to combine multiple `.js` files into one file, you can drop the files in `js/concat` and buildozer output a single `all.js` file. The files themselves are also compiled to the destination folder for whenever they need to be used stand alone.

## SVG sprites

You can combine multiple `<svg>`s you use into one sprite. Just drop the files in the `img/sprite` folder and the sprite will be generated as `dest/img/sprite/sprite.svg`.

## Browser sync

[Browsersync](https://browsersync.io) can be enabled for as well serving static sites (`server` option) or dynamic sites (`proxy` option). With the `reload` option, you can define a glob to watch for. Browsersync will then reload the page if one of the matching files is changed. For example, use `**/*.html` to watch for changes in HTML files.

## Browserslist
Browserslist is a single configuration for all tools that need to know what browsers you support. Just create a Browserslist compatible configuration and define the browsers you want to support.

For example you could place a `.browserslistrc` in your document root.
```
# Browsers that we support

last 1 version
> 1%
IE 10 # sorry
```

Tools like Autoprefixer will compile according to the Browserslist configuration you defined.

## RFS

The [RFS](https://github.com/twbs/rfs) PostCSS plugin is included by default which allows you to use the `rfs()` function in your Sass.

## PostCSS plugins

Loading extra PostCSS plugins can be done by overriding the default config. This can be done in multiple ways documented on the [postcss-load-config](https://github.com/michael-ciniawsky/postcss-load-config) repository.

For example you could place a `postcss.config.js` in your document root.

```javascript
module.exports = () => {
  return {
        plugins: {
          'rfs': {},
          'autoprefixer': {},
          'cssnano': {}
        }
    }
};

```

## Copy

Additionally files can be copied before if needed. Useful whenever you need some files from the `node_modules` folder which you don't have available on production.

```yaml
copy:
  - src: node_modules/jquery/dist/jquery.min.js
    dest: js/vendor
  - src: node_modules/bootstrap/dist/js/bootstrap.min.js
    dest: js/vendor
```

## Options

### `verbose`

Use `buildozer build --verbose` to output more details. With this option all files which are copied are logged. You'll also see some more information about the images which are compressed.

## Thanks

Thanks [Intracto](https://www.intracto.com/?utm_source=github&utm_campaign=buildozer) for development maintenance & [icons8](https://www.icons8.com/?utm_source=github&utm_campaign=buildozer) for providing a logo.
