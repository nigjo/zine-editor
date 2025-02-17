function l10n(key, fallback, ...args) {

  if (args.length === 0) {
    if (key in window.langData) {
      return window.langData[key];
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
  const langTag = document.getElementById('lang_' + navigator.language);
  if (langTag) {
    return Promise.resolve(JSON.parse(langTag.textContent));
  } else {
    return fetch('res/lang_' + navigator.language + '.json').then(r => {
      if (r.ok)
        return r.json();
      if (r.status === 404)
        return null;
      throw r;
    }).catch(e => {
      throw Error('unable to load lang data for ' + navigator.language, {cause: e});
    });
  }
}
updateLocale().then(langData => {
  if (langData) {
    window.langData = langData;
    console.log(langData);
    const texts = document.querySelectorAll('[data-l10n]');
    console.log(texts);
    for (const e of texts) {
      if (e.dataset.l10n in langData) {
        e.textContent = langData[e.dataset.l10n];
      } else {
        console.log('skip entry', e.dataset.l10n);
      }
    }
  } else {
    console.log('no lang data for ' + navigator.language);
  }
}).catch(e => console.warn(e));