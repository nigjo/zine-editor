function l10n(key, fallback, ...args) {
  if (!("langConfig" in window)) {
    throw Error('language information not initialized, yet');
  }

  if (args.length === 0) {
    if (key in langConfig.data) {
      return langConfig.data[key];
    }
    return fallback;
  } else {
    console.log('TEMPLATE', args);
    //from https://stackoverflow.com/a/67022370
    const message = Object.keys(args)
            .reduce((acc, key) => acc.replaceAll(`\{${key}\}`, args[key]),
                    l10n(key, fallback));
    console.log('TEMPLATE', 'msg=', message);
    return message;
  }
}

function updateLocale() {
  const usedLang = navigator.language;
  const langTag = document.getElementById('lang_' + usedLang);
  console.debug('INLINE', langTag);
  if (langTag) {
    return Promise.resolve({
      lang: usedLang,
      data: JSON.parse(langTag.textContent)
    });
  } else {
    return fetch('res/lang_' + usedLang + '.json').then(r => {
      if (r.ok)
        return {
          lang: usedLang,
          data: r.json()
        };
      if (r.status === 404)
        return null;
      throw r;
    }).catch(e => {
      throw Error('unable to load lang data for ' + navigator.language, {cause: e});
    });
  }
}

updateLocale().then(loaded => {
  window.langConfig = {
    lang: loaded ? loaded.lang : 'en',
    data: loaded ? loaded.data : {}
  };
  //window.langData = loaded ? loaded.data : {};
  document.dispatchEvent(new CustomEvent('lang-loaded', {detail: langConfig}));
  document.documentElement.setAttribute("lang", langConfig.lang);
  if (Object.keys(langConfig.data).length > 0) {
    console.log(langConfig);
    const texts = document.querySelectorAll('[data-l10n]');
    //console.log(texts);
    for (const e of texts) {
      if (e.dataset.l10n in langConfig.data) {
        e.textContent = langConfig.data[e.dataset.l10n];
      } else {
        console.log('skip entry', e.dataset.l10n);
      }
    }
  } else {
    console.log('no lang data for ' + langConfig.lang);
  }
}).catch(e => console.warn(e));