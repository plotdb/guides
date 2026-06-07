# @plotdb/guides

A private collection of coding guidelines and AI prompts for internal development at plotdb.

Guidelines are organized under `src/`, covering topics such as coding style, framework conventions, and environment setup. They are intended to be used as context for AI-assisted development.


## Usage

After installing this package, run the following in your project root:

    npx plotdb-guides init

This creates a `context/` directory and a `context/shared` symlink pointing to `node_modules/@plotdb/guides/src`, making the guidelines available as shared context for AI tools.


## Commands

`plotdb-guides init`

 - Creates the `context/` directory in the current working directory
 - Creates a `context/shared` symlink pointing to `node_modules/@plotdb/guides/src`
 - Skips if `context/shared` already exists
