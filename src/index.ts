
/* IMPORT */

import vscode from 'vscode';
import * as Commands from './commands';

/* MAIN */

const activate = (): void => {

  vscode.commands.registerCommand ( 'diff.file', Commands.file );

};

/* EXPORT */

export {activate};
