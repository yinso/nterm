# NTerm is not a Term

NTerm (NTerm is not a Term) is a different take on what a terminal should be. It offers the following capabilities.

* Every terminal session is automatically tracked and kept separate.
* Every background job (jobs you started with `&`) is tracked separately from the terminal.
* Every log dump is automatically saved and can easily be opened for examination.
* You can easily manage environment variable for all the sessions, as well as individual sessions.

NTerm is designed to be a "command line call manager" first and foremost. A full terminal emulation will come after the first goal is achieved.

## Install

    npm install -g nterm

## Build

* `gulp css` - builds css.
* `gulp js` - builds js
* `gulp build` - builds everything
* `gulp start` - builds and start nterm
