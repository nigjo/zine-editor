/* global markdownit, markdownitDeflist */

"use strict";
//import markdownit from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
//import markdownit from './markdown-it.min.js';
//const markdownit = markdownit;
//const markdownitDeflist = markdownitDeflist;
//import markdownitDeflist from 'https://cdn.jsdelivr.net/npm/markdown-it-deflist@3.0.0/+esm';
//import markdownitDeflist from './markdown-it-deflist.min.js';

document.addEventListener('lang-loaded', e => {
  switch (e.detail.lang) {
    case 'de':
      e.detail.data['error.title'] = 'Fehler';
      e.detail.data['error.no_markdown_file'] =
              'Keine Markdowndatei gefunden.\nFüge eine `.md`-Datei hinzu.';
      e.detail.data['error.args.no_filename'] = 'Fehlender Dateiname';
      e.detail.data['error.arg.not_relative'] =
              'Dateipfad muss relativ zum Ordner dieser Seite sein.\n\n`{0}`';
      e.detail.data['error.arg.invalid_path'] =
              'Ungültiger Pfad.\n\n`{0}`';
      e.detail.data['error.file_protocol'] =
              'Nachladen via `file://` Protokoll ist nicht möglich.'
              + ' Dateien per Drag&Drop hier einfügen.';
      break;
  }
});


const md = markdownit()
        .use(markdownitDeflist);

class FileManager {
  constructor() {
    this.projectname = 'default';
    this.files = {};
    this.data = {};
  }
  addFile(file) {
    this.removeFile(file.name);
    this.files[file.name] = file;
  }
  removeFile(filename) {
    delete this.files[filename];
    if (filename in this.data) {
      URL.revokeObjectURL(this.data[filename]);
      delete this.data[filename];
    }
  }
  hasFile(filename) {
    return Object.keys(this.files).includes(filename);
  }
  getFile(filename) {
    if (filename in this.files)
      return this.files[filename];
    return null;
  }
  getData(filename) {
    if (filename in this.files) {
      if (filename in this.data)
        return this.data[filename];
      this.data[filename] =
              URL.createObjectURL(this.files[filename]);
      return this.data[filename];
    }
    return undefined;
  }
  reset() {
    const names = Object.keys(this.files);
    const context = this;
    names.forEach(n => context.removeFile(n));
    this.updateList().catch(() => {
      /*ignore errors here*/
    });
  }
  updateList() {
    //console.debug(Object.keys(this.files));
    let mdFile = null;
    const container = document.createElement('div');
    container.classList.add('filelist');

    for (const file of Object.values(this.files)) {
      //console.debug(file);
      if (!mdFile && file.name.endsWith('md')) {
        mdFile = file;
      }
      const fig = document.createElement('figure');
      fig.dataset.filename = file.name;

      const del = document.createElement('button');
      del.textContent = '\uD83D\uDDD1';
      del.onclick = () => {
        console.log('removing', file.name);
        this.removeFile(file.name);
        this.updateList()
                .then(d => createZine(d))
                .catch(e => createErrorZine(e));
        ;
      };
      fig.append(del);

      const cap = document.createElement('figcaption');
      cap.textContent = file.name;
      fig.append(cap);

      container.append(fig);
    }

    document.querySelector('#files .filelist').replaceWith(container);

    if (mdFile) {
      return mdFile.text();
    }
    return Promise.reject(
            l10n('error.no_markdown_file',
                    'No markdown file found.\nadd one `.md` file.'
                    ));
  }
}
const fileManager = new FileManager();

function createErrorZine(message) {
  createZine('# '
          + l10n('error.title', 'Error')
          + '\n\n' + message);
}

function createZine(rawMdText, basedir) {

  document.getElementById('custom')?.remove();

  let plainMdText = rawMdText;
  if (plainMdText.includes('<style>')) {
    const start = plainMdText.indexOf('<style>');
    const end = plainMdText.indexOf('</style>', start);
    if (start >= 0 && end > 0) {
      const mdText = plainMdText.substring(0, start)
              + plainMdText.substring(end + '</style>'.length);
      document.head.insertAdjacentHTML('beforeend',
              plainMdText.substring(start, end + '</style>'.length));
      document.head.lastElementChild.id = 'custom';
      plainMdText = mdText;
    }
  } else {
    //add placeholder
    document.head.insertAdjacentHTML('beforeend',
            '<style id="custom"></style>');
  }

  //remove HTML comments before processing
  while (plainMdText.includes('<!--')) {
    const start = plainMdText.indexOf('<!--');
    const end = plainMdText.indexOf('-->', start);
    const mdText =
            plainMdText.substring(0, start)
            + plainMdText.substring(end + '-->'.length);
    plainMdText = mdText;
  }


  const resultText = md.render(plainMdText);

  const mdData = document.createElement('template');
  mdData.innerHTML = resultText;

  //console.debug('IMG', mdData.content.querySelectorAll('img'));
  for (const img of mdData.content.querySelectorAll('img')) {
    if (img.title) {
      img.className = img.title;
      img.removeAttribute('title');
    }
    const filename = img.getAttribute('src');
    //console.debug(filename);
    if (fileManager.hasFile(filename)) {
      const data = fileManager.getData(filename);
      if (data) {
        img.src = data;
        console.debug('replaced', filename);
      }
    } else if (basedir) {
      img.src = basedir + '/' + filename;
      console.debug('rebased', filename);
    }
  }

  const pages = document.createElement('div');
  pages.id = "zinecontent";
  //const pages = document.createDocumentFragment();
  const pageTpl = document.getElementById('pagebase');
  let page = 1;
  const page1 = pageTpl.content.cloneNode(true);
  page1.querySelector('.page').classList.add('page1');
  let current = page1.querySelector('.page .content');
  page1.querySelector('.pagenum').textContent = '- ' + page + ' -';
  //console.log(page, current);
  pages.append(page1);

  for (var item of mdData.content.children) {
    //console.log(item);
    if (item.tagName === 'H1') {
      if (page !== 1) {
        continue;
      }
      if (item.textContent !== '') {
        current.append(item.cloneNode(true));
      }
    } else if (item.tagName === 'H2') {
      ++page;
      if (page > 8) {
        break;
      }
      const nextPage = pageTpl.content.cloneNode(true);
      nextPage.querySelector('.page').classList.add('page' + (page));
      nextPage.querySelector('.pagenum').textContent = '- ' + page + ' -';
      current = nextPage.querySelector('.page .content');
      //console.log(page, current);
      pages.append(nextPage);

      if (item.textContent !== '')
        current.append(item.cloneNode(true));
    } else {
      current.append(item.cloneNode(true));
    }
  }
  while (page < 8) {
    ++page;
    const nextPage = pageTpl.content.cloneNode(true);
    nextPage.querySelector('.page').classList.add('page' + (page));
    nextPage.querySelector('.pagenum').textContent = '- ' + page + ' -';
    current = nextPage.querySelector('.page .content');
    //console.log(page, current);
    pages.append(nextPage);
  }

  document.getElementById('zinecontent')
          .replaceWith(pages);
}



function loadSource() {
  const source = document.getElementById('zinecontent');
  console.log('loaded', source.contentDocument);
  let fileContent = '';
  if (source.contentDocument) {
    fileContent = source.contentDocument.body.textContent;
    //find zine-specific styles
  } else if (source.innerText !== '') {
    //Fallback 
    fileContent = source.innerText;
  } else {
    console.log('no source', source);
    return;
  }
  createZine(fileContent, source.dataset.basedir);
}

function initDragging(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "copy";
  document.body.classList.add('dragging');
  //console.log(ev);
}

function handleNewFiles(ev) {
  ev.preventDefault();
  console.log(ev);
  document.body.classList.remove('dragging');
  [...ev.dataTransfer.items].forEach((item, i) => {
    // If dropped items aren't files, reject them
    if (item.kind === "file") {
      const file = item.getAsFile();
      console.log(`… file[${i}].name = ${file.name}`);
      fileManager.addFile(file);
    }
  });

  fileManager.updateList()
          .then(d => createZine(d))
          .catch(e => createErrorZine(e));
}

function loadZine(basedir, mdfile) {
  //console.debug(basedir, mdfile);
  fetch(basedir + '/' + mdfile).then(r => {
    if (r.ok)
      return r.text();
    throw r;
  }).then(mdtext => {
    fileManager.reset();
    createZine(mdtext, basedir);
  });
}

function init() {
  console.log('init');
  function loadCustomFile(query) {
    const fileArg = query.get('file');
    const path = fileArg.split(/\/+/);
    if (path.length === 0) {
      //TODO:error
      console.warn('missing file value', fileArg, path);
      createErrorZine(l10n('error.args.no_filename', 'Missing file name.'));
    } else if (path[0] === '') {
      //TODO:error
      console.warn('no relative path', fileArg, path);
      createErrorZine(l10n('error.arg.not_relative',
              'File path must be relative to the page folder.\n\n`{0}`',
              fileArg));
    } else if (path.includes('..')) {
      console.warn('invalid file path', fileArg, path);
      createErrorZine(l10n('error.arg.invalid_path',
              'Invalid file path.\n\n`{0}`', fileArg));
    } else {
      //console.debug(path);
      const mdfile = path.pop();
      //console.debug(path, mdfile);
      if (path.length === 0)
        loadZine('.', mdfile);
      else
        loadZine(path.join('/'), mdfile);
    }
  }

  function initContent() {
    const source = document.getElementById('zinecontent');
    //source.onload = () => ;
    const query = new URLSearchParams(location.search);
    if (source.textContent !== '') {
      //load zine content from index.html. Always.
      createZine(source.textContent, '.');
    } else if (location.protocol === 'file:') {
      //no webserver used for editor
      document.querySelector('nav').classList.add('local');
      document.getElementById('ordered').checked = true;
      createErrorZine(l10n('error.file_protocol',
              'Loading via `file://` is not allowed. Drag & Drop your files here.'));
    } else if (query.has('file')) {
      loadCustomFile(query);
    } else {
      //Show default zine on page load
      if (document.documentElement.getAttribute('lang') === 'de')
        loadZine('userguide', 'zine.content_de.md');
      else
        loadZine('userguide', 'zine.content.md');
    }
  }
  function initDragAndDrop() {
    const target = document.body;
    target.addEventListener("dragover", ev => ev.preventDefault());
    target.addEventListener("dragleave", ev => {
      ev.preventDefault();
      if (ev.target.id === 'files') {
        document.body.classList.remove('dragging');
      }
    });
    target.addEventListener("dragenter", initDragging);
    target.addEventListener("drop", handleNewFiles);
  }

  initContent();
  initDragAndDrop();
}

if (document.readyState === 'loading') {
  console.log('waiting...');
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}