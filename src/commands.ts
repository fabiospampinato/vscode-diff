
/* IMPORT */

import path from 'node:path';
import isBinaryPath from 'is-binary-path';
import {alert, getActiveBinaryFilePath, getActiveTextualFilePath, getActiveUntitledFile, getOpenFilesPaths, getOpenUntitledFiles, getProjectRootPath, openInDiffEditor, prompt} from 'vscode-extras';
import {getFileLabel, getFileTemp, getFilesByGlobs, getFilesByNames, getIgnoreFromFilePaths, getOptions, isString, sortByPath} from './utils';

/* MAIN */

const file = async (): Promise<void> => {

  const binaryFilePath = getActiveBinaryFilePath ();
  const textualFilePath = getActiveTextualFilePath ();
  const untitledFile = getActiveUntitledFile ();

  const target = binaryFilePath || textualFilePath || untitledFile;
  const targetPath = isString ( target ) ? target : target?.path;

  if ( !target || !targetPath ) return alert.error ( 'You need to open a file to diff first' );

  const options = getOptions ();
  const rootPath = getProjectRootPath ();

  const isBinary = ( targetPath === binaryFilePath );
  const isTextual = !isBinary;

  const isCompatible = ( filePath: string ) => isBinaryPath ( filePath ) === isBinary;
  const isTarget = ( filePath: string ) => filePath === targetPath;

  const filesUntitled = isTextual && options.showUntitledFiles && options.showOpenFiles ? getOpenUntitledFiles () : [];
  const filesUntitledCompatible = filesUntitled.filter ( file => !isTarget ( file.path ) );
  const filesUntitledSorted = sortByPath ( filesUntitledCompatible, file => file.path );

  const filesOpen = options.showOpenFiles ? getOpenFilesPaths () : [];
  const filesOpenCompatible = filesOpen.filter ( filePath => isCompatible ( filePath ) && !isTarget ( filePath ) );
  const filesOpenSorted = sortByPath ( filesOpenCompatible, filePath => filePath );

  const filesFound = rootPath && options.showFoundFiles ? await getFilesByGlobs ( rootPath, options.include, options.exclude ) : [];
  const filesIgnoreFound = rootPath && options.showFoundFiles ? await getFilesByNames ( rootPath, options.ignore ) : [];
  const isIgnored = getIgnoreFromFilePaths ( filesIgnoreFound );
  const filesFoundCompatible = filesFound.filter ( filePath => !isIgnored ( filePath ) && isCompatible ( filePath ) && !isTarget ( filePath ) );
  const filesFoundSorted = sortByPath ( filesFoundCompatible, filePath => filePath );

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

  const items = [...itemsUntitled, ...itemsOpen, ...itemsFound];

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
