<p align="center">
  <img src="https://raw.githubusercontent.com/MartijnCuppens/buildozer/master/.github/buildozer.svg?sanitize=true" alt="Buildozer logo">
  <br>
  <br>
  <a href="https://npmjs.org/package/buildozer"><img src="https://img.shields.io/npm/v/buildozer.svg" alt="npm version"></a>
  <a href="https://github.com/Intracto/buildozer/actions"><img src="https://github.com/Intracto/buildozer/workflows/Run%20tests/badge.svg" alt="Actions status"></a>
  <img src="https://david-dm.org/Intracto/buildozer.svg" alt="Dependencies">
</p>

Buildozer is a simple build system to compile Sass, minify images or SVGs and compile javascript. It's a wrapper built around [Gulp](https://gulpjs.com/) which frees you from configuring and maintaining packages.

- [Installation](#installation)
- [Commands](#commands)
- [Order of script execution](#order-of-script-execution)
- [Defaultt folder structure](#default-folder-structure)
- [Customizing the folder structure](#customizing-the-folder-structure)
- [Browserslist](#browserslist)
- [RFS](#rfs)
- [PostCSS plugins](#postcss-plugins)
- [Copy](#copy)
- [RFS](#rfs)
- [Config search](#config-search)
- [Linting](#linting)
- [Options](#options)
- [Contributing to Buildozer](#contributing-to-buildozer)
- [Thanks](#thanks)

## Installation

```shell
# With npm
npm i buildozer

# Or install with yarn
yarn add buildozer
```

## Commands

Both the `build` and `watch` commands output the files to the same directory.

### Build

```shell
buildozer build
```

The `build` task can be used for production environments. The build command:

- Copy files [if needed](#copy)
- Clean all destination folders
- Lint source code if [configured](#linting)
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
- Clean all destination folders
- Lint source code if [configured](#linting)
- Compiles Sass to CSS
- Use [autoprefixer](https://github.com/postcss/autoprefixer) for vendor prefixing
- Add Sass sourcemaps if applicable
- Minifies images and svg
- Transpiles ES6 to ES5
- Concatenate `.js` files in the `concat` folder
- Run `browsersync` if configured

### Separate tasks

`buildozer clean` is run to clear all folders defined in `dest`. `buildozer copy`, `buildozer css`, `buildozer js`, `buildozer js-concat` , `buildozer svg-sprite` and `buildozer img` can be used to run the subtasks of `buildozer build`.

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
├── css/
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
└── dist/
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

## Customizing the folder structure

Buildozer uses a `.buildozerrc` configuration file which uses the yaml syntax and defines which paths are used. By default, this file looks like this:

```yaml
src_base_path: ./
dest_base_path: ./
css:
  - src: css/**/*.css
    dest: dist/css
  - src: css/**/*.scss
    dest: dist/css
  - src: css/**/*.sass
    dest: dist/css
img:
  - src: img/**/*.png
    dest: dist/img
  - src: img/**/*.jpg
    dest: dist/img
  - src: img/**/*.jpeg
    dest: dist/img
  - src: img/**/*.gif
    dest: dist/img
  - src: img/**/*.svg
    dest: dist/img
js:
  - src: js/**/*.js
    dest: dist/js
js-concat:
  - src: js/concat/*.js
    name: all.js
    dest: dist/js
svg-sprite:
  - src: img/sprite/*.svg
    name: sprite.svg
    dest: dist/img/sprite
browsersync:
  server: null # Static sites
  proxy: null # Dynamic sites
  reload: null # Glob to watch for reload
```

If you want to configure your own paths, you can run `buildozer config` to generate a `.buildozerrc` in your folder and change the paths however you like. All `src` paths are prefixed `src_base_path`, the `dest` paths are prefixed with `dest_base_path`.

## Concat

If you want to combine multiple `.js` files into one file, you can drop the files in `js/concat` and Buildozer will generate a single `all.js` file. The files themselves are also compiled to the destination folder for whenever they need to be used stand alone.

## SVG sprites

You can combine multiple `<svg>`s you use into one sprite. Just drop the files in the `img/sprite` folder and the sprite will be generated as `dist/img/sprite/sprite.svg`.

## Browser sync

[Browsersync](https://browsersync.io) can be enabled for as well serving static sites (`server` option) or dynamic sites (`proxy` option). With the `reload` option, you can define a glob to watch for. Browsersync will then reload the page if one of the matching files is changed. For example, use `**/*.html` to watch for changes in HTML files.

## Browserslist

Browserslist is a single configuration for all tools that need to know what browsers you support. Just create a Browserslist compatible configuration and define the browsers you want to support.

For example you could place a `.browserslistrc` in your document root.

```text
# Browsers that we support

last 1 version
> 1%
IE 10 # sorry
```

Tools like Autoprefixer will compile according to the Browserslist configuration you defined.

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

## Config search

In your `.buildozerrc` configuration file, it is possible to enable config search. With this feature you can drop `.buildozerrc` in sub folders within your project which will be detected by Buildozer. This way you can bundle your CSS, JS or images in a folder they belong to without the need of a seperate setup. Make sure to exclude folders in which you do not want to look for configuration files with the `ignore` option.

```yaml
config_search:
  enabled: true
  ignore:
    - '**/vendor/**'
    - '**/node_modules/**'
```

The following structure represents a simplified Drupal folder structure in which `.buildozerrc` files are used to create a modular setup:

```text
drupal_project/
├── modules/
|   └── custom/
|       ├── custom_module_1/
|       |   ├── js/
|       |   │   └── module-js.js
|       |   └── .buildozerrc
|       └── custom_module_2/
|           ├── img/
|           │   └── module-img.svg
|           └── .buildozerrc
├── themes/
|   └── custom/
|     └── custom_theme/
|         ├── css/
|         │   └── main.scss
|         ├── js/
|         │   └── main.js
|         └── .buildozerrc
└── .buildozerrc # In this file `config_search` is enabled
```

## Linting

As soon as Buildozer detects a linting configuration file, linting will be enabled. Buildozer takes a pretty aggressive approach when the linting rules are not followed: if the linting fails, no CSS or JS will be build.

### ESLint

[ESLint](https://github.com/eslint/eslint#readme) is JavaScript linter which can easily be enabled by dropping your [cosmiconfig](https://github.com/davidtheclark/cosmiconfig#readme) configuration in the folder which you want to be linted.

```text
project/
├── css/
│   └── …
├── js/
│   └── …
├── img/
│   └── …
├── .buildozer
├── .eslintignore # Optional ignore file
└── .eslintrc
```

### Stylelint

Apart from just javascript linting, Buildozer also provides CSS linting with [stylelint](https://github.com/stylelint/stylelint). Just drop the configuration file to get started:

```text
project/
├── css/
│   └── …
├── js/
│   └── …
├── img/
│   └── …
├── .buildozer
└── .stylelint
```

## Options

### `verbose`

Use `buildozer build --verbose` (or watch) to output more details. With this option all files which are copied are logged. You'll also see some more information about the images which are compressed.

### `fix`

Use `buildozer watch --fix` (or build) to fix linting issues that can be fixed automatically.

### `disable-autoprefixer`

Autoprefixer will always run, even if you don't configure it in a custom PostCSS config. To disable it, use `buildozer build --disable-autoprefixer`.

### `env`

The environment variable `env` determines whether files need to be minified. Minification will be enabled whenever this variable is set to `production`. If anything else is set, minification will be disabled. By default, the `build` command uses `production`, unless the variable is overridden by something else like `buildozer build --env=development`.

## Contributing to Buildozer

Looking to contribute something to Buildozer? Just have a look at the [open issues](https://github.com/Intracto/buildozer/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc) to check if there's anything interesting. You can also just have a look at the source code to see if there's anything which can be improved.

### Getting started

These are the steps you'll need to take to create a new PR.

- Make sure you have the [latest node and npm version](https://nodejs.org/en/) installed
- Fork the buildozer repository
- Clone your fork
- Make a new branch describing what you want to fix/add
- Develop your excellent code
  - Make sure to add tests if needed
  - Some tests are meant to fail, these tests are checked in `test/fail-tests.js`
- Run `npm test` to check every test passes
- Commit, push & create a PR
- Describe what is changed in your PR description

## Thanks

Thanks [Intracto](https://www.intracto.com/?utm_source=github&utm_campaign=buildozer) for development maintenance & [icons8](https://www.icons8.com/?utm_source=github&utm_campaign=buildozer) for providing a logo.
