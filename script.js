// Store all orders in this array
const orders = [];

// Language handling
let currentLang = 'en'; // Default language is English
let translationsEn = {}; // Fallback English
let translationsCurrent = {}; // Selected language

// Get references to DOM elements
const elements = {
    title: document.getElementById('pageTitle'),
    heading: document.getElementById('heading'),
    labelName: document.getElementById('labelName'),
    nameInput: document.getElementById('nameInput'),
    toppingsContainer: document.getElementById('toppingsContainer'),
    buttonNext: document.getElementById('buttonNext'),
    buttonFinish: document.getElementById('buttonFinish'),
    output: document.getElementById('output'),
    formContainer: document.getElementById('formContainer'),
    languageSelector: document.getElementById('languageSelector')
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    currentLang = elements.languageSelector.value;

    elements.languageSelector.addEventListener('change', e => {
        currentLang = e.target.value;
        loadTranslations();
    });

    loadTranslations();
});

// Load translations from JSON files
async function loadTranslations() {
    try {
        translationsEn = await fetch('locales/lang_en.json').then(r => r.json());

        if (currentLang === 'en') {
            translationsCurrent = translationsEn;
        } else {
            try {
                translationsCurrent = await fetch(`locales/lang_${currentLang}.json`).then(r => r.json());
            } catch {
                translationsCurrent = {};
            }
        }

        updateUI();
    } catch (e) {
        console.error('Error loading translations:', e);
    }
}

// Translation lookup helper
function t(key) {
    if (key in translationsCurrent && translationsCurrent[key]) {
        return translationsCurrent[key];
    }
    if (key in translationsEn && translationsEn[key]) {
        return translationsEn[key];
    }
    return key;
}

// Update all text and UI states
function updateUI() {
    elements.title.textContent = t('title');
    elements.heading.textContent = t('heading');
    elements.labelName.textContent = t('labelName');
    elements.nameInput.placeholder = t('namePlaceholder');
    elements.buttonNext.textContent = t('buttonNext');
    elements.buttonFinish.textContent = t('buttonFinish');

    buildToppings(t('ingredients') || []);

    elements.output.textContent = '';
    elements.formContainer.style.display = 'block';
    elements.output.style.fontSize = '1rem';
    elements.nameInput.value = '';
    orders.length = 0;
}

// Build interactive topping buttons
function buildToppings(toppings) {
    elements.toppingsContainer.innerHTML = '';
    toppings.forEach(topping => {
        const div = document.createElement('div');
        div.className = 'topping';
        div.dataset.topping = topping;
        div.textContent = topping;
        div.addEventListener('click', () => {
            div.classList.toggle('selected');
        });
        elements.toppingsContainer.appendChild(div);
    });
}


// Saves one order and resets the form
function addOrder() {
    const name = elements.nameInput.value.trim();
    if (!name) {
        alert(t('alertNoName'));
        return;
    }

    const selectedToppings = Array.from(document.querySelectorAll('.topping.selected'))
        .map(div => div.dataset.topping);

    orders.push({
        name,
        toppings: selectedToppings
    });

    elements.nameInput.value = '';
    document.querySelectorAll('.topping.selected').forEach(div => div.classList.remove('selected'));
}

// Shows order summary and hides form
function finalizeOrders() {
    const name = elements.nameInput.value.trim();
    const selectedToppings = Array.from(document.querySelectorAll('.topping.selected'))
        .map(div => div.dataset.topping);

    if (name || selectedToppings.length > 0) {
        orders.push({
            name: name || t('unknownName'),
            toppings: selectedToppings
        });
    }

    if (orders.length === 0) {
        alert(t('alertNoOrders'));
        return;
    }

    let text = t('summaryTitle') + "\n----------------------\n";

    orders.forEach((entry, i) => {
        text += `${i + 1}. ${entry.name} ${t('wants')}:\n`;
        if (entry.toppings.length === 0) {
            text += "   " + t('summaryNoToppings') + "\n";
        } else {
            entry.toppings.forEach(topping => {
                text += `   - ${topping}\n`;
            });
        }
        text += '\n';
    });

    elements.output.textContent = text;
    elements.formContainer.style.display = 'none';
    elements.output.style.fontSize = '1.3rem';

    elements.nameInput.value = '';
    document.querySelectorAll('.topping.selected').forEach(div => div.classList.remove('selected'));
}