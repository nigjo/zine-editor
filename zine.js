"use strict";
//import markdownit from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
//import markdownit from './markdown-it.min.js';
//const markdownit = markdownit;
//const markdownitDeflist = markdownitDeflist;
//import markdownitDeflist from 'https://cdn.jsdelivr.net/npm/markdown-it-deflist@3.0.0/+esm';
//import markdownitDeflist from './markdown-it-deflist.min.js';

const md = markdownit().use(markdownitDeflist);

function createZine(rawMdText) {
  const resultText = md.render(rawMdText);

  const mdData = document.createElement('template');
  mdData.innerHTML = resultText;

  //console.log('IMG', mdData.content.querySelectorAll('img'));
  for (const img of mdData.content.querySelectorAll('img')) {
    if (img.title) {
      img.className = img.title;
      img.removeAttribute('title');
    }
  }

  const pages = document.createElement('div');
  pages.id = "pages";
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


const source = document.getElementById('zinecontent');

function loadSource() {
  if (source.contentDocument) {
    //console.log(source.contentDocument);
    let fulltext = source.contentDocument.body.textContent;
    if (fulltext.includes('<style>')) {
      let start = fulltext.indexOf('<style>');
      let end = fulltext.indexOf('</style>', start);
      if (start >= 0 && end > 0) {
        let mdText =
                fulltext.substring(0, start) + fulltext.substring(end + '</style>'.length);
        createZine(mdText);
        document.head.insertAdjacentHTML('beforeend',
                fulltext.substring(start, end + '</style>'.length));
      } else {
        createZine(source.contentDocument.body.textContent);
      }
    } else {
      createZine(source.contentDocument.body.textContent);
    }
  }
}

source.onload = loadSource;
const query = new URLSearchParams(location.search);
if (query.has('file')) {
  source.setAttribute('data', query.get('file'));
} else {
  loadSource();
}