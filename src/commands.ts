
/* IMPORT */

import path from 'node:path';
import isBinaryPath from 'is-binary-path';
import {alert, getActiveBinaryFilePath, getActiveTextualFilePath, getActiveUntitledFile, getOpenFilesPaths, getOpenUntitledFiles, getProjectRootPath, openInDiffEditor, prompt} from 'vscode-extras';
import {getFileLabel, getFileRelative, getFileTemp, getFiles, getOptions, isString, sortByPath} from './utils';

/* MAIN */

const file = async (): Promise<void> => {

  const binaryFilePath = getActiveBinaryFilePath ();
  const textualFilePath = getActiveTextualFilePath ();
  const untitledFile = getActiveUntitledFile ();

  const target = binaryFilePath || textualFilePath || untitledFile;
  const targetPath = isString ( target ) ? target : target?.path;
  const targetFolderPath = targetPath ? path.dirname ( targetPath ) : undefined;

  if ( !target || !targetPath || !targetFolderPath ) return alert.error ( 'You need to open a file to diff first' );

  const options = getOptions ();
  const rootPath = getProjectRootPath ();

  const isBinary = ( targetPath === binaryFilePath );
  const isTextual = !isBinary;
  const isUntitled = !!untitledFile;

  const isCompatible = ( filePath: string ) => isBinaryPath ( filePath ) === isBinary;
  const isTarget = ( filePath: string ) => filePath === targetPath;

  const filesUntitled = isTextual && options.showUntitledFiles && options.showOpenFiles ? getOpenUntitledFiles () : [];
  const filesUntitledCompatible = filesUntitled.filter ( file => !isTarget ( file.path ) );
  const filesUntitledSorted = sortByPath ( filesUntitledCompatible, file => file.path );

  const filesOpen = options.showOpenFiles ? getOpenFilesPaths () : [];
  const filesOpenCompatible = filesOpen.filter ( filePath => isCompatible ( filePath ) && !isTarget ( filePath ) );
  const filesOpenSorted = sortByPath ( filesOpenCompatible, filePath => filePath );

  const filesFound = rootPath && options.showFoundFiles ? await getFiles ( rootPath, options.include, options.exclude, options.ignore ) : [];
  const filesFoundCompatible = filesFound.filter ( filePath => isCompatible ( filePath ) && !isTarget ( filePath ) );
  const filesFoundSorted = sortByPath ( filesFoundCompatible, filePath => filePath );

  const filesFoundRelativeSorted = !isUntitled && options.showFoundRelativeFiles ? filesFoundSorted : [];

  const openLabel = options.showFoundFiles ? 'open' : undefined;

  const itemsUntitled = filesUntitledSorted.map ( file => ({
    label: file.path,
    description: openLabel,
    file
  }));

  const itemsOpen = filesOpenSorted.map ( filePath => ({
    label: getFileLabel ( rootPath, filePath ),
    description: openLabel,
    filePath
  }));

  const itemsFound = filesFoundSorted.map ( filePath => ({
    label: getFileLabel ( rootPath, filePath ),
    filePath
  }));

  const itemsFoundRelative = filesFoundRelativeSorted.map ( filePath => ({
    label: getFileRelative ( targetFolderPath, filePath ),
    filePath
  }));

  const items = [...itemsUntitled, ...itemsOpen, ...itemsFound, ...itemsFoundRelative];

  if ( !items.length ) return alert.error ( 'No files to diff against found' );

  const item = await prompt.select ( 'Select a file to diff against...', items );

  if ( !item ) return;

  const leftPath = !isString ( target ) ? await getFileTemp ( target.path, target.content ) : targetPath;
  const rightPath = ( 'file' in item ) ? await getFileTemp ( item.file.path, item.file.content ) : item.filePath;

  const leftName = path.basename ( leftPath );
  const rightName = path.basename ( rightPath );

  const title = ( leftName !== rightName ) ? `${leftName} ↔ ${rightName}` : `${leftName} (${leftPath}) ↔ ${rightName} (${rightPath})`; //TODO: Improve this, using the whole path is pretty snoisy

  openInDiffEditor ( leftPath, rightPath, title );

};

/* EXPORT */

export {file};
