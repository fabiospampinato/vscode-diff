
/* IMPORT */

import fastIgnore from 'fast-ignore';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readdir from 'tiny-readdir-glob';
import vscode from 'vscode';
import {getConfig} from 'vscode-extras';
import zeptoid from 'zeptoid';
import type {Options} from './types';

/* MAIN */

//TODO: Maybe promote the "ignore function generation" stuff to a standalone package, as it could be broadly useful

const getFileDepth = ( filePath: string ): number => {

  return filePath.split ( /\\|\//g ).length;

};

const getFileLabel = ( rootPath: string | undefined, filePath: string ): string => {

  if ( !rootPath ) return filePath;
  if ( !filePath.startsWith ( rootPath ) ) return filePath;

  return unixify ( filePath.slice ( rootPath.length + 1 ) );

};

const getFileTemp = async ( filePath: string, fileContent: Buffer | string ): Promise<string> => {

  const tempFileName = path.basename ( filePath );
  const tempFolderPath = path.join ( os.tmpdir (), zeptoid () );
  const tempFilePath = path.join ( tempFolderPath, tempFileName );

  await fs.promises.mkdir ( tempFolderPath, { recursive: true } );
  await fs.promises.writeFile ( tempFilePath, fileContent );

  return tempFilePath;

};

const getFilesByGlobs = async ( rootPath: string, includeGlob: string | string[], excludeGlob?: string | string[] ): Promise<string[]> => {

  const {files} = await readdir ( includeGlob, {
    cwd: rootPath,
    ignore: excludeGlob,
    followSymlinks: false
  });

  return files;

};

const getFilesByNames = async ( rootPath: string, fileNames: string[] ): Promise<string[]> => {

  if ( !fileNames.length ) return [];

  const {files} = await readdir ( `**/${fileNames}`, {
    cwd: rootPath,
    followSymlinks: false
  });

  return files;

};

const getFilesExclude = (): string[] => {

  const excludes = vscode.workspace.getConfiguration ().get ( 'files.exclude' );

  if ( !isObject ( excludes ) ) return [];

  const globs = Object.entries ( excludes ).filter ( ([ _, enabled ]) => enabled ).map ( ([ glob ]) => glob );

  return globs;

};

const getIgnoreFromFilePath = ( filePath: string ): (( filePath: string ) => boolean) => {

  const fileContent = fs.readFileSync ( filePath, 'utf8' );
  const folderPath = path.dirname ( filePath );
  const ignore = fastIgnore ( fileContent );

  return ( filePath: string ): boolean => {

    return ignore ( path.relative ( folderPath, filePath ) );

  };

};

const getIgnoreFromFilePaths = ( filePaths: string[] ): (( filePath: string ) => boolean) => {

  const ignores = filePaths.map ( getIgnoreFromFilePath );

  if ( !ignores.length ) return () => false;

  return ( filePath: string ): boolean => {

    return ignores.some ( ignore => ignore ( filePath ) );

  };

};

const getOptions = (): Options => {

  const config = getConfig ( 'diff' );
  const exclude = isArray ( config?.exclude ) && config.exclude.every ( isString ) ? config.exclude : getFilesExclude ();
  const ignore = isArray ( config?.ignore ) && config.ignore.every ( isString ) ? config.ignore : ['.gitignore'];
  const include = isArray ( config?.include ) && config.include.every ( isString ) && config.include.length ? config.include : ['**/*'];
  const showUntitledFiles = isBoolean ( config?.showUntitledFiles ) ? config.showUntitledFiles : true;
  const showOpenFiles = isBoolean ( config?.showOpenFiles ) ? config.showOpenFiles : true;
  const showFoundFiles = isBoolean ( config?.showFoundFiles ) ? config.showFoundFiles : true;

  return { exclude, ignore, include, showUntitledFiles, showOpenFiles, showFoundFiles };

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

export {getFileDepth, getFileLabel, getFileTemp, getFilesByGlobs, getFilesByNames, getFilesExclude, getIgnoreFromFilePath, getIgnoreFromFilePaths, getOptions, isArray, isBoolean, isObject, isString, sortByPath, unixify};
