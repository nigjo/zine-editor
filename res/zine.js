"use strict";
//import markdownit from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
//import markdownit from './markdown-it.min.js';
//const markdownit = markdownit;
//const markdownitDeflist = markdownitDeflist;
//import markdownitDeflist from 'https://cdn.jsdelivr.net/npm/markdown-it-deflist@3.0.0/+esm';
//import markdownitDeflist from './markdown-it-deflist.min.js';

const md = markdownit().use(markdownitDeflist);

const fileManager = {
  files: {},
  data: {},
  addFile: (file) => {
    fileManager.removeFile(file.name);
    fileManager.files[file.name] = file;
  },
  removeFile: (filename) => {
    delete fileManager.files[filename];
    if (filename in fileManager.data) {
      URL.revokeObjectURL(fileManager.data[filename]);
      delete fileManager.data[filename];
    }
  },
  hasFile: (filename) => Object.keys(fileManager.files).includes(filename),
  getFile: (filename) => {
    if (filename in fileManager.files)
      return fileManager.files[filename];
    return null;
  },
  getData: (filename) => {
    if (filename in fileManager.files) {
      if (filename in fileManager.data)
        return fileManager.data[filename];
      fileManager.data[filename] =
              URL.createObjectURL(fileManager.files[filename]);
      return fileManager.data[filename];
    }
    return undefined;
  },
  updateList: () => {
    console.log(Object.keys(fileManager.files));
    let mdFile = null;
    const container = document.createElement('div');
    container.classList.add('filelist');

    for (const file of Object.values(fileManager.files)) {
      console.log(file);
      if (!mdFile && file.name.endsWith('md')) {
        mdFile = file;
      }
      const fig = document.createElement('figure');
      fig.dataset.filename = file.name;

      const del = document.createElement('button');
      del.textContent = '\uD83D\uDDD1';
      del.onclick = () => {
        console.log('remove', file.name);
        fileManager.removeFile(file.name);
        fileManager.updateList()
                .then(d => createZine(d))
                .catch(e => console.error(e));
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
    return Promise.resolve('# Error\n\nNo markdown file found.\nadd one `.md` file.');
  }
};

function createZine(rawMdText) {

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

  const basedir = document.getElementById('zinecontent').dataset.basedir;
  //console.log('IMG', mdData.content.querySelectorAll('img'));
  for (const img of mdData.content.querySelectorAll('img')) {
    if (img.title) {
      img.className = img.title;
      img.removeAttribute('title');
    }
    const filename = img.getAttribute('src');
    console.log(filename);
    if (fileManager.hasFile(filename)) {
      const data = fileManager.getData(filename);
      if (data) {
        img.src = data;
        console.log('replaced');
      }
    } else if (basedir) {
      console.log('rebased');
      img.src = basedir + '/' + filename;
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
  createZine(fileContent);
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
          .catch(e => console.error(e));
}

function init() {
  console.log('init');
  const source = document.getElementById('zinecontent');
  source.onload = loadSource;
  const query = new URLSearchParams(location.search);
  if (query.has('file')) {
    source.setAttribute('data', query.get('file'));
  } else if (source.contentDocument) {
    //loadSource();
    console.log('init', source.contentDocument);
  }
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

if (document.readyState === 'loading') {
  console.log('waiting...');
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}