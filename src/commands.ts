
/* IMPORT */

import * as _ from 'lodash';
import * as absolute from 'absolute';
import * as isBinaryPath from 'is-binary-path';
import * as path from 'path';
import * as vscode from 'vscode';
import Utils from './utils';

/* COMMANDS */

function diff ( leftPath, rightPath ) {

  const leftUri = vscode.Uri.file ( leftPath ),
        rightUri = vscode.Uri.file ( rightPath ),
        leftName = path.basename ( leftPath ),
        rightName = path.basename ( rightPath ),
        title = ( leftName !== rightName ) ? `${leftName} ↔ ${rightName}` : `${leftName} (${leftPath}) ↔ ${rightName} (${rightPath})`;

  return vscode.commands.executeCommand ( 'vscode.diff', leftUri, rightUri, title );

}

async function file () {

  const {activeTextEditor} = vscode.window,
        activePath = activeTextEditor && activeTextEditor.document.uri.fsPath;

  if ( !activePath ) return vscode.window.showErrorMessage ( 'You cannot diff an unsaved file' );

  if ( !absolute ( activePath ) ) return vscode.window.showErrorMessage ( 'You cannot diff an unsaved file' );

  const findFiles = await vscode.workspace.findFiles ( '**/*' ),
        findPaths = findFiles.map ( file => file.fsPath ),
        documentsPaths = vscode.workspace.textDocuments.map ( doc => doc.uri.fsPath ).filter ( path => !/\.git$/.test ( path ) ),
        textualPaths = findPaths.concat ( documentsPaths ).filter ( path => !isBinaryPath ( path ) ),
        uniqPaths = _.uniq ( textualPaths ) as string[],
        otherPaths = uniqPaths.filter ( path => path !== activePath );

  if ( otherPaths.length < 1 ) return vscode.window.showErrorMessage ( 'You need to have at least 2 saved files in order to start a diff' );

  let otherPath;

  if ( otherPaths.length === 1 ) {

    otherPath = otherPaths[0];

  } else {

    const rootPath = Utils.folder.getRootPath ( activePath ),
          rootPathWithSlash = rootPath ? `${rootPath}/` : false,
          otherPathsTrimmed = otherPaths.map ( path => rootPathWithSlash && path.startsWith ( rootPathWithSlash ) ? path.substr ( rootPathWithSlash.length ) : path ),
          items = otherPathsTrimmed.map ( ( label, i ) => ({ label, path: otherPaths[i], description: '' }) ),
          [itemsAbsolute, itemsRelative] = _.partition ( items, item => item.label.startsWith ( '/' ) ),
          [itemsNested, itemsNotNested] = _.partition ( itemsRelative, item => item.label.includes ( '/' ) ),
          itemsSorted = Utils.sortItemsByPath ( itemsAbsolute ).concat ( Utils.sortItemsByPath ( itemsNested ).concat ( Utils.sortItemsByPath ( itemsNotNested ) ) ) as typeof items,
          item = await vscode.window.showQuickPick ( itemsSorted, { placeHolder: 'Select a file to diff against...' } );

    if ( item ) otherPath = item.path;

  }

  if ( !otherPath ) return;

  return diff ( activePath, otherPath );

}

/* EXPORT */

export {diff, file};
