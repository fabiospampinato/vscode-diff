
/* IMPORT */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readdir from 'tiny-readdir-glob-gitignore';
import vscode from 'vscode';
import {getConfig} from 'vscode-extras';
import zeptoid from 'zeptoid';
import type {Options} from './types';

/* MAIN */

const getFileDepth = ( filePath: string ): number => {

  return filePath.split ( /\\|\//g ).length;

};

const getFileLabel = ( rootPath: string | undefined, filePath: string ): string => {

  if ( !rootPath ) return filePath;
  if ( !filePath.startsWith ( rootPath ) ) return filePath;

  return unixify ( filePath.slice ( rootPath.length + 1 ) );

};

const getFileRelative = ( rootPath: string, filePath: string ): string => {

  const relative = unixify ( path.relative ( rootPath, filePath ) );

  if ( relative.startsWith ( '../' ) ) return relative;
  if ( relative.startsWith ( './' ) ) return relative;

  return `./${relative}`;

};

const getFileTemp = async ( filePath: string, fileContent: Buffer | string ): Promise<string> => {

  const tempFileName = path.basename ( filePath );
  const tempFolderPath = path.join ( os.tmpdir (), zeptoid () );
  const tempFilePath = path.join ( tempFolderPath, tempFileName );

  await fs.promises.mkdir ( tempFolderPath, { recursive: true } );
  await fs.promises.writeFile ( tempFilePath, fileContent );

  return tempFilePath;

};

const getFiles = async ( rootPath: string, includeGlob: string | string[], excludeGlob: string | string[], ignoreNames: string[] ): Promise<string[]> => {

  const {files} = await readdir ( includeGlob, {
    cwd: rootPath,
    ignore: excludeGlob,
    ignoreFiles: ignoreNames,
    ignoreFilesFindAbove: false,
    followSymlinks: false
  })

  return files;

};

const getFilesExclude = (): string[] => {

  const excludes = vscode.workspace.getConfiguration ().get ( 'files.exclude' );

  if ( !isObject ( excludes ) ) return [];

  const globs = Object.entries ( excludes ).filter ( ([ _, enabled ]) => enabled ).map ( ([ glob ]) => glob );

  return globs;

};

const getOptions = (): Options => {

  const config = getConfig ( 'diff' );
  const exclude = isArray ( config?.exclude ) && config.exclude.every ( isString ) ? config.exclude : getFilesExclude ();
  const ignore = isArray ( config?.ignore ) && config.ignore.every ( isString ) ? config.ignore : ['.gitignore'];
  const include = isArray ( config?.include ) && config.include.every ( isString ) && config.include.length ? config.include : ['**/*'];
  const showUntitledFiles = isBoolean ( config?.showUntitledFiles ) ? config.showUntitledFiles : true;
  const showOpenFiles = isBoolean ( config?.showOpenFiles ) ? config.showOpenFiles : true;
  const showFoundFiles = isBoolean ( config?.showFoundFiles ) ? config.showFoundFiles : true;
  const showFoundRelativeFiles = isBoolean ( config?.showFoundRelativeFiles ) ? config.showFoundRelativeFiles : false;

  return { exclude, ignore, include, showUntitledFiles, showOpenFiles, showFoundFiles, showFoundRelativeFiles };

};

const isArray = ( value: unknown ): value is any[] => {

  return Array.isArray ( value );

};

const isBoolean = ( value: unknown ): value is boolean => {

  return typeof value === 'boolean';

};

const isObject = ( value: unknown ): value is Record<string, unknown> => {

  return typeof value === 'object' && value !== null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const sortByPath = (() => {

  return <T> ( items: T[], iterator: ( item: T ) => string ): T[] => {

    return [...items].sort ( ( a, b ) => {

      const ap = iterator ( a );
      const bp = iterator ( b );

      return ( getFileDepth ( ap ) - getFileDepth ( bp ) ) || ap.localeCompare ( bp );

    });

  };

})();

const unixify = (() => {

  const re = /\\+/g;

  return ( filePath: string ): string => {

    return filePath.replace ( re, '/' );

  };

})();

/* EXPORT */

export {getFileDepth, getFileLabel, getFileRelative, getFileTemp, getFiles, getFilesExclude, getOptions, isArray, isBoolean, isObject, isString, sortByPath, unixify};
