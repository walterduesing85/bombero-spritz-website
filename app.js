const form = document.querySelector('#event-form');
const fields = form.elements;
const panels = ['step-one', 'step-plan', 'step-two'].map((id) =>
    document.getElementById(id),
);
const options = [
    { box: 'aperitivo_an', qty: 'aperitivo', on: true, suggest: (g, h) => Math.ceil(g * h) },
    { box: 'wasser_an', qty: 'wasser_still', on: true, suggest: (g) => Math.ceil(g / 2) },
    { box: 'wasser_an', qty: 'wasser_sprudel', on: true, suggest: (g) => Math.floor(g / 2) },
    { box: 'bubbles_an', qty: 'bubbles_qty', suggest: (g) => g },
    { box: 'limonade_an', qty: 'limonade', suggest: (g) => g },
    { box: 'bier_an', qty: 'bier_alkoholfrei', suggest: (g) => Math.floor(g / 2) },
    { box: 'bier_an', qty: 'bier_peroni', suggest: (g) => Math.ceil(g / 2) },
    { box: 'tramezzini_an', qty: 'tramezzini', suggest: (g) => g },
];

let previous = null;
let currentStep = 0;
const stepLabel = document.getElementById('step-label');
const summaryBox = document.getElementById('summary');

const now = new Date();
fields.datum.min = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
].join('-');

function show(n) {
    panels.forEach((panel, index) => {
        panel.hidden = index !== n;
    });

    currentStep = n;
    if (n === 1) {
        recap();
    }
    I18N.say(stepLabel, `step${n}`);
    panels[n].querySelector('input,select').focus();
}

function recap() {
    const en = I18N.lang === 'en';
    const items = [
        I18N.option(fields.eventtyp.value),
        en ? `${fields.gaeste.value} guests` : `${fields.gaeste.value} Gäste`,
        en ? `${fields.stunden.value} hours of bar service` : `${fields.stunden.value} Stunden Barservice`,
        fields.adresse.value.trim(),
    ];
    const list = document.getElementById('event-recap');

    list.replaceChildren(...items.map((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        return item;
    }));
}

function valid(panel) {
    for (const element of panel.querySelectorAll('input,select,textarea')) {
        if (!element.reportValidity()) {
            return false;
        }
    }

    return true;
}

function count(name) {
    return Math.max(
        0,
        Math.min(1000000, Math.floor(Number(fields[name].value) || 0)),
    );
}

function suggestion(option) {
    return option.suggest(Number(fields.gaeste.value), Number(fields.stunden.value));
}

function waterTotal() {
    const liters = (count('wasser_still') + count('wasser_sprudel')) * 0.2;

    return liters.toLocaleString(I18N.locale(), { maximumFractionDigits: 1 });
}

function sync() {
    document.getElementById('wasser-total').textContent =
        `${I18N.lang === 'en' ? 'Total water' : 'Wasser gesamt'}: ${waterTotal()} ${I18N.lang === 'en' ? 'litres' : 'Liter'}`;

    options.forEach(({ box, qty }) => {
        const enabled = fields[box].checked;
        fields[qty].disabled = !enabled;
        fields[qty].closest('.option-body').hidden = !enabled;
    });
    fields.bubbles.disabled = !fields.bubbles_an.checked;

    document.querySelectorAll('[data-quantity]').forEach((button) => {
        const input = fields[button.dataset.quantity];
        button.disabled =
            input.disabled ||
            (Number(button.dataset.delta) < 0 && count(input.name) === 0);
    });
}

function suggestions(force = false) {
    const current = {
        guests: Number(fields.gaeste.value),
        hours: Number(fields.stunden.value),
    };
    const guestsChanged = !previous || previous.guests !== current.guests;
    const hoursChanged = !previous || previous.hours !== current.hours;

    options.forEach((option) => {
        if (force && option.on) {
            fields[option.box].checked = true;
        }

        const relevant = option.qty === 'aperitivo' ?
            guestsChanged || hoursChanged :
            guestsChanged;

        if (fields[option.box].checked && (force || relevant)) {
            fields[option.qty].value = suggestion(option);
        }
    });

    previous = current;
    sync();
}

function releaseIfZero(option) {
    const group = options.filter((item) => item.box === option.box);

    if (
        fields[option.qty].value !== '' &&
        group.every((item) => count(item.qty) === 0)
    ) {
        fields[option.box].checked = false;
    }
}

options.forEach((option) => {
    const element = fields[option.qty];

    element.addEventListener('keydown', (event) => {
        if (['-', '+', 'e', 'E', '. ', '.', ','].includes(event.key)) {
            event.preventDefault();
        }
    });

    element.addEventListener('input', () => {
        if (
            element.value !== '' &&
            (!Number.isInteger(Number(element.value)) ||
                Number(element.value) < 0 ||
                Number(element.value) > 1000000)
        ) {
            element.value = count(option.qty);
        }

        releaseIfZero(option);
        sync();
    });

    element.addEventListener('blur', () => {
        element.value = count(option.qty);
        releaseIfZero(option);
        sync();
    });

    fields[option.box].addEventListener('change', () => {
        element.value = fields[option.box].checked ? suggestion(option) : 0;
        sync();
    });
});

document.querySelectorAll('[data-quantity]').forEach((button) => {
    button.addEventListener('click', () => {
        const name = button.dataset.quantity;
        fields[name].value = Math.max(
            0,
            Math.min(1000000, count(name) + Number(button.dataset.delta)),
        );
        releaseIfZero(options.find((option) => option.qty === name));
        sync();
    });
});

document.getElementById('next').addEventListener('click', () => {
    if (valid(panels[0])) {
        const changed =
            previous &&
            (previous.guests !== Number(fields.gaeste.value) ||
                previous.hours !== Number(fields.stunden.value));
        suggestions();
        I18N.say(document.getElementById('quantity-status'), changed ? 'quantitiesChanged' : '');
        show(1);
    }
});

document.getElementById('reset-quantities').addEventListener('click', () => {
    suggestions(true);
    I18N.say(document.getElementById('quantity-status'), 'quantitiesReset');
});

function summary(withLink = false) {
    const en = I18N.lang === 'en';
    const number = (value) => value.toLocaleString(I18N.locale(), { maximumFractionDigits: 1 });
    const chosen = (box) => fields[box].checked;
    const bubbles = I18N.option(fields.bubbles.value);
    const water = number((count('wasser_still') + count('wasser_sprudel')) * 0.2);
    const head = en ? [
        `Type of event: ${I18N.option(fields.eventtyp.value)}`,
        `${fields.gaeste.value} guests · ${fields.stunden.value} hours of bar service`,
        `Date: ${fields.datum.value}`,
        `Location address: ${fields.adresse.value.trim()}${withLink ? mapLink() : ''}`,
    ] : [
        `Art des Events: ${fields.eventtyp.value}`,
        `${fields.gaeste.value} Gäste · ${fields.stunden.value} Stunden Barservice`,
        `Datum: ${fields.datum.value}`,
        `Adresse der Location: ${fields.adresse.value.trim()}${withLink ? mapLink() : ''}`,
    ];
    const lines = [];

    if (chosen('aperitivo_an')) {
        lines.push(en ?
            `${count('aperitivo')} spritz aperitivos` :
            `${count('aperitivo')} Spritz-Aperitivi`);
    }
    if (chosen('wasser_an')) {
        lines.push(en ?
            `Water (0.2 l bottles): ${count('wasser_still')} still · ${count('wasser_sprudel')} sparkling · total ${water} litres` :
            `Wasser (0,2-l-Flaschen): ${count('wasser_still')} still · ${count('wasser_sprudel')} sprudelnd · gesamt ${water} Liter`);
    }
    if (chosen('bubbles_an')) {
        lines.push(en ?
            `Welcome bubbles: ${bubbles} · ${count('bubbles_qty')} glasses` :
            `Begrüßungsbubbles: ${bubbles} · ${count('bubbles_qty')} Gläser`);
    }
    if (chosen('limonade_an')) {
        lines.push(en ?
            `${count('limonade')} servings of lemonade` :
            `${count('limonade')} Portionen Limonade`);
    }
    if (chosen('bier_an')) {
        lines.push(en ?
            `Peroni beer (0.3 l): ${count('bier_alkoholfrei')} non-alcoholic · ${count('bier_peroni')} with alcohol` :
            `Peroni-Bier (0,3 l): ${count('bier_alkoholfrei')} alkoholfrei · ${count('bier_peroni')} mit Alkohol`);
    }
    if (chosen('tramezzini_an')) {
        lines.push(en ?
            `${count('tramezzini')} tuna tramezzini` :
            `${count('tramezzini')} Thunfisch-Tramezzini`);
    }
    lines.push(en ? 'Olives included as a snack.' : 'Oliven als Snack inbegriffen.');

    return `${head.join('\n')}\n\n${lines.join('\n')}`;
}

document.getElementById('plan-next').addEventListener('click', () => {
  options.forEach(({ qty }) => {
    fields[qty].value = count(qty);
  });

  if (valid(panels[1])) {
    summaryBox.textContent = summary();
    show(2);
  }
});

document.getElementById('plan-back').addEventListener('click', () => show(0));
document.getElementById('back').addEventListener('click', () => show(1));
document.getElementById('back-event').addEventListener('click', () => show(0));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const en = I18N.lang === 'en';
  const body = en ? `Hello Bombero team,

I would like to enquire about your mobile bar with staff and drinks.

${summary(true)}

Additional wishes: ${fields.wunsch.value || '–'}
Name: ${fields.name.value}
Email: ${fields.email.value}
Phone: ${fields.telefon.value || '–'}

Please confirm availability and price.
Kind regards
${fields.name.value}` : `Hallo Bombero-Team,

ich möchte eure mobile Bar mit Personal und Getränken anfragen.

${summary(true)}

Weitere Wünsche: ${fields.wunsch.value || '–'}
Name: ${fields.name.value}
E-Mail: ${fields.email.value}
Telefon: ${fields.telefon.value || '–'}

Bitte bestätigt Verfügbarkeit und Preis.
Viele Grüße
${fields.name.value}`;
  const subject = (en ? 'Non-alcoholic event enquiry on ' : 'Alkoholfreie Eventanfrage am ') + fields.datum.value;

  const status = document.getElementById('status');
  const submit = form.querySelector('button[type="submit"]');

  if (fields.website.value) {
    return;
  }

  submit.disabled = true;
  I18N.say(status, 'sending');

  try {
    const response = await fetch('https://formsubmit.co/ajax/info@bomberospritz.de', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: subject,
        _replyto: fields.email.value,
        _template: 'box',
        _captcha: 'false',
        name: fields.name.value,
        email: fields.email.value,
        message: body,
      }),
    });
    const result = await response.json();

    if (!response.ok || String(result.success) !== 'true') {
      throw new Error('send failed');
    }

    I18N.say(status, 'sent');
    submit.hidden = true;
    document.querySelector('.back-row').hidden = true;
  } catch (error) {
    submit.disabled = false;
    mailtoFallback = `mailto:info@bomberospritz.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    I18N.say(status, 'sendFailed');
    document.getElementById('mail-fallback').hidden = false;
  }
});

let mailtoFallback = '';
document.getElementById('mail-fallback').addEventListener('click', () => {
  location.href = mailtoFallback;
});

function validationMessage(element) {
    const state = element.validity;
    const step = element.step || '1';

    if (state.valueMissing) {
        return element.type === 'checkbox' ? 'Please tick this box if you want to proceed.' :
            element.tagName === 'SELECT' ? 'Please select an item in the list.' :
            'Please fill out this field.';
    }
    if (state.typeMismatch) {
        return element.type === 'email' ? 'Please enter a valid email address.' : 'Please enter a valid value.';
    }
    if (state.badInput) {
        return element.type === 'date' ? 'Please enter a valid date.' : 'Please enter a number.';
    }
    if (state.rangeUnderflow) {
        return element.type === 'date' ?
            `Please select a date on or after ${element.min}.` :
            `Value must be greater than or equal to ${element.min}.`;
    }
    if (state.rangeOverflow) {
        return element.type === 'date' ?
            `Please select a date on or before ${element.max}.` :
            `Value must be less than or equal to ${element.max}.`;
    }
    if (state.stepMismatch) {
        return `Please enter a valid value. The step is ${step}.`;
    }
    if (state.tooShort) {
        return `Please lengthen this text to ${element.minLength} characters or more.`;
    }
    if (state.patternMismatch) {
        return 'Please match the requested format.';
    }

    return '';
}

form.addEventListener('invalid', (event) => {
    const element = event.target;
    element.setCustomValidity('');
    if (I18N.lang === 'en') {
        element.setCustomValidity(validationMessage(element));
    }
}, true);

form.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
form.addEventListener('change', (event) => event.target.setCustomValidity?.(''));

I18N.onChange(() => {
    [...fields].forEach((element) => element.setCustomValidity?.(''));

    I18N.say(stepLabel, `step${currentStep}`);
    sync();
    if (currentStep === 1) {
        recap();
    }
    if (!panels[2].hidden) {
        summaryBox.textContent = summary();
    }
});

I18N.say(stepLabel, 'step0');
sync();
const venue = {
    input: fields.adresse,
    list: document.getElementById('venue-suggestions'),
    consent: document.getElementById('venue-consent'),
    mapBox: document.getElementById('venue-map'),
    map: null,
    marker: null,
    coords: null,
    chosen: '',
    timer: null,
    request: 0,
    active: -1,
};

function mapLink() {
    return venue.coords && venue.chosen === venue.input.value.trim() ?
        `\nhttps://www.openstreetmap.org/?mlat=${venue.coords[0]}&mlon=${venue.coords[1]}#map=17/${venue.coords[0]}/${venue.coords[1]}` :
        '';
}

function venueEnabled() {
    return localStorage.getItem('mapConsent') === '1';
}

function venueState() {
    venue.consent.hidden = venueEnabled();
}

function closeSuggestions() {
    venue.list.hidden = true;
    venue.list.innerHTML = '';
    venue.input.setAttribute('aria-expanded', 'false');
    venue.active = -1;
}

function formatPlace(properties) {
    const street = [properties.street || properties.name, properties.housenumber].filter(Boolean).join(' ');
    const town = [properties.postcode, properties.city || properties.town || properties.village || properties.county].filter(Boolean).join(' ');
    return [street, town, properties.country].filter(Boolean).join(', ');
}

function showMap(lat, lon) {
    venue.coords = [lat, lon];
    venue.mapBox.hidden = false;

    if (!venue.map) {
        venue.map = L.map(venue.mapBox, { scrollWheelZoom: false });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        }).addTo(venue.map);
        venue.marker = L.marker([lat, lon]).addTo(venue.map);
    }

    venue.marker.setLatLng([lat, lon]);
    venue.map.setView([lat, lon], 16);
    venue.map.invalidateSize();
}

function chooseSuggestion(item) {
    venue.input.value = item.label;
    venue.chosen = item.label;
    venue.input.setCustomValidity('');
    closeSuggestions();
    showMap(item.lat, item.lon);
}

function renderSuggestions(items) {
    venue.list.innerHTML = '';
    venue.active = -1;

    if (!items.length) {
        closeSuggestions();
        return;
    }

    items.forEach((item) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.textContent = item.label;
        li.addEventListener('mousedown', (event) => {
            event.preventDefault();
            chooseSuggestion(item);
        });
        venue.list.appendChild(li);
    });
    venue.list._items = items;
    venue.list.hidden = false;
    venue.input.setAttribute('aria-expanded', 'true');
}

async function lookup(query) {
    const id = ++venue.request;
    const url = `https://photon.komoot.io/api/?limit=6&lang=${I18N.lang === 'en' ? 'en' : 'de'}&lat=52.52&lon=13.405&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (id !== venue.request) {
            return;
        }

        const seen = new Set();
        const items = data.features
            .map((feature) => ({
                label: formatPlace(feature.properties),
                lat: feature.geometry.coordinates[1],
                lon: feature.geometry.coordinates[0],
            }))
            .filter((item) => item.label && !seen.has(item.label) && seen.add(item.label));
        renderSuggestions(items);
    } catch (error) {
        closeSuggestions();
    }
}

venue.input.addEventListener('input', () => {
    clearTimeout(venue.timer);
    venue.coords = null;
    venue.mapBox.hidden = true;
    const query = venue.input.value.trim();

    if (!venueEnabled() || query.length < 3) {
        closeSuggestions();
        return;
    }

    venue.timer = setTimeout(() => lookup(query), 300);
});

venue.input.addEventListener('keydown', (event) => {
    const rows = [...venue.list.children];

    if (venue.list.hidden || !rows.length) {
        return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        venue.active = (venue.active + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length;
        rows.forEach((row, index) => row.classList.toggle('active', index === venue.active));
    } else if (event.key === 'Enter' && venue.active >= 0) {
        event.preventDefault();
        chooseSuggestion(venue.list._items[venue.active]);
    } else if (event.key === 'Escape') {
        closeSuggestions();
    }
});

venue.input.addEventListener('blur', closeSuggestions);

document.getElementById('venue-allow').addEventListener('click', () => {
    localStorage.setItem('mapConsent', '1');
    venueState();
    venue.input.focus();

    if (venue.input.value.trim().length >= 3) {
        lookup(venue.input.value.trim());
    }
});

venueState();
