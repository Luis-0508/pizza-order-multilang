// Store all orders in this array
const bestellungen = [];

// Language handling
let currentLang = 'en'; // Default language is English
let translationsEn = {}; // Holds fallback English translations
let translationsCurrent = {}; // Holds currently selected language translations

// Get references to all relevant DOM elements
const elements = {
    title: document.getElementById('pageTitle'),
    heading: document.getElementById('heading'),
    labelName: document.getElementById('labelName'),
    nameInput: document.getElementById('nameInput'),
    zutatenContainer: document.getElementById('zutatenContainer'),
    buttonNext: document.getElementById('buttonNext'),
    buttonFinish: document.getElementById('buttonFinish'),
    output: document.getElementById('output'),
    formContainer: document.getElementById('formContainer'),
    languageSelector: document.getElementById('languageSelector')
};

// Run on initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Get language from the select field
    currentLang = elements.languageSelector.value;

    // Re-load translations when language changes
    elements.languageSelector.addEventListener('change', e => {
        currentLang = e.target.value;
        loadTranslations();
    });

    // Load initial translations
    loadTranslations();
});

/**
 * Loads the translation JSON files and updates the UI.
 * English is always loaded as fallback.
 */
async function loadTranslations() {
    try {
        // Load English (fallback)
        translationsEn = await fetch('locales/lang_en.json').then(r => r.json());

        // Load selected language (if not English)
        if (currentLang === 'en') {
            translationsCurrent = translationsEn;
        } else {
            try {
                translationsCurrent = await fetch(`locales/lang_${currentLang}.json`).then(r => r.json());
            } catch {
                // If loading fails, fallback to empty object (keys will fallback to English)
                translationsCurrent = {};
            }
        }

        // Update all texts in the UI
        updateUI();
    } catch (e) {
        console.error('Error loading translations:', e);
    }
}

/**
 * Translation helper function.
 * Falls back to English, or key itself if missing.
 */
function t(key) {
    if (key in translationsCurrent && translationsCurrent[key]) {
        return translationsCurrent[key];
    }
    if (key in translationsEn && translationsEn[key]) {
        return translationsEn[key];
    }
    return key; // If no translation found at all
}

/**
 * Updates all static text content in the interface using current language.
 * Also resets form and clears previous orders.
 */
function updateUI() {
    elements.title.textContent = t('title');
    elements.heading.textContent = t('heading');
    elements.labelName.textContent = t('labelName');
    elements.nameInput.placeholder = t('namePlaceholder');
    elements.buttonNext.textContent = t('buttonNext');
    elements.buttonFinish.textContent = t('buttonFinish');

    // Build the ingredient buttons from translation array
    buildIngredients(t('ingredients') || []);

    // Reset UI state
    elements.output.textContent = '';
    elements.formContainer.style.display = 'block';
    elements.output.style.fontSize = '1rem';
    elements.nameInput.value = '';
    bestellungen.length = 0;
}

/**
 * Builds the list of clickable ingredient buttons.
 */
function buildIngredients(ingredients) {
    elements.zutatenContainer.innerHTML = '';
    ingredients.forEach(ingredient => {
        const div = document.createElement('div');
        div.className = 'zutat';
        div.dataset.zutat = ingredient;
        div.textContent = ingredient;
        div.addEventListener('click', () => {
            div.classList.toggle('selected');
        });
        elements.zutatenContainer.appendChild(div);
    });
}

/**
 * Called when user clicks "Next".
 * Stores current entry and clears the form.
 */
function naechster() {
    const name = elements.nameInput.value.trim();
    if (!name) {
        alert(t('alertNoName'));
        return;
    }

    const zutaten = Array.from(document.querySelectorAll('.zutat.selected'))
        .map(div => div.dataset.zutat);

    bestellungen.push({
        name,
        zutaten
    });

    // Clear form for next person
    elements.nameInput.value = '';
    document.querySelectorAll('.zutat.selected').forEach(div => div.classList.remove('selected'));
}

/**
 * Called when user clicks "Finish".
 * Adds last entry (if any), and shows the full summary.
 */
function fertig() {
    const name = elements.nameInput.value.trim();
    const zutaten = Array.from(document.querySelectorAll('.zutat.selected'))
        .map(div => div.dataset.zutat);

    // Add final entry if name or ingredients selected
    if (name || zutaten.length > 0) {
        bestellungen.push({
            name: name || t('unknownName'),
            zutaten
        });
    }

    if (bestellungen.length === 0) {
        alert(t('alertNoOrders'));
        return;
    }

    // Build summary output
    let text = t('summaryTitle') + "\n----------------------\n";

    bestellungen.forEach((entry, i) => {
        text += `${i + 1}. ${entry.name} ${t('wants')}:\n`;
        if (entry.zutaten.length === 0) {
            text += "   " + t('summaryNoToppings') + "\n";
        } else {
            entry.zutaten.forEach(z => {
                text += `   - ${z}\n`;
            });
        }
        text += '\n';
    });

    // Show summary and hide form
    elements.output.textContent = text;
    elements.formContainer.style.display = 'none';
    elements.output.style.fontSize = '1.3rem';

    // Clear form (optional)
    elements.nameInput.value = '';
    document.querySelectorAll('.zutat.selected').forEach(div => div.classList.remove('selected'));
}