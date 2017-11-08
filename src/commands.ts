
/* IMPORT */

import * as _ from 'lodash';
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

  const {activeTextEditor} = vscode.window,
        activePath = activeTextEditor && activeTextEditor.document.uri.fsPath;

  if ( !absolute ( activePath ) ) return vscode.window.showErrorMessage ( 'You cannot diff an unsaved file' );

  const files = await vscode.workspace.findFiles ( '**/*' ),
        paths = files.map ( file => file.fsPath ),
        otherPaths = paths.filter ( path => path !== activePath );

  if ( otherPaths.length < 1 ) return vscode.window.showErrorMessage ( 'You need to have at least 2 saved files in order to start a diff' );

  let otherPath;

  if ( otherPaths.length === 1 ) {

    otherPath = otherPaths[0];

  } else {

    const rootPath = Utils.folder.getRootPath ( activePath ),
          otherPathsTrimmed = otherPaths.map ( path => rootPath && path.startsWith ( rootPath ) ? path.substr ( rootPath.length + 1 ) : path ),
          items = otherPathsTrimmed.map ( ( label, i ) => ({ label, path: otherPaths[i], description: '' }) ),
          item = await vscode.window.showQuickPick ( items );

    if ( item ) otherPath = item.path;

  }

  if ( !otherPath ) return;

  return diff ( activePath, otherPath );

}

/* EXPORT */

export {diff, file};
