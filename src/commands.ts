
/* IMPORT */

import * as absolute from 'absolute';
import * as vscode from 'vscode';
import Utils from './utils';

/* COMMANDS */

function diff ( leftPath, rightPath ) {

  const app = Utils.isInsiders () ? 'code-insiders' : 'code',
        term = vscode.window.createTerminal ( 'Diff' );

  term.sendText ( `${app} --diff "${leftPath}" "${rightPath}" && logout`, true );

}

async function file () {

  const docs = vscode.workspace.textDocuments,
        paths = docs.map ( doc => doc.uri.fsPath );

  if ( paths.length < 2 ) return vscode.window.showErrorMessage ( 'You have to open at least 2 saved files in order to start a diff' );

  const {activeTextEditor} = vscode.window,
         activePath = activeTextEditor && activeTextEditor.document.uri.fsPath;

  if ( !absolute ( activePath ) ) return vscode.window.showErrorMessage ( 'You cannot diff an unsaved file' );

  const otherPaths = paths.filter ( path => path !== activePath && absolute ( path ) );

  if ( otherPaths.length < 1 ) return vscode.window.showErrorMessage ( 'You have to open at least 2 saved files in order to start a diff' );

  const otherPath = ( otherPaths.length === 1 ) ? otherPaths[0] : await vscode.window.showQuickPick ( otherPaths );

  if ( !otherPath ) return;

  return diff ( activePath, otherPath );

}

/* EXPORT */

export {file};
