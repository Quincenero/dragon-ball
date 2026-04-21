const container = document.getElementById("personajes-container");
const searchInput = document.getElementById("search");

let allCharacters = [];
let currentCharacters = [];
let currentPage = 1;
const limit = 12;

// Detectar página
const esIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/";
const esPersonajes = window.location.pathname.includes("personajes.html");

// SCROLL
function scrollToTopOfCards() {
    const grid = document.querySelector('.grid');
    const paginationTop = document.querySelector('.pagination-top');

    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (paginationTop) {
        paginationTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// TRAER TODOS LOS PERSONAJES (para búsqueda)
async function getAllCharacters() {
    let all = [];
    let page = 1;
    let totalPages = 1;

    try {
        while (page <= totalPages) {
            const res = await fetch(`https://dragonball-api.com/api/characters?page=${page}&limit=50`);
            const data = await res.json();

            all = [...all, ...data.items];
            totalPages = data.meta.totalPages;
            page++;
        }
        return all;
    } catch (error) {
        console.error("Error cargando TODOS:", error);
        return [];
    }
}

// CARGAR PERSONAJES
async function loadCharacters(page = 1, shouldScroll = true) {
    if (!container) return;

    try {
        container.innerHTML = "<p>Cargando personajes...</p>";

        const res = await fetch(`https://dragonball-api.com/api/characters?page=${page}&limit=${limit}`);
        const data = await res.json();

        currentCharacters = data.items;
        currentPage = data.meta.currentPage;

        renderCharacters(currentCharacters, data);

        if (shouldScroll) {
            requestAnimationFrame(scrollToTopOfCards);
        }

    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = "<p>Error al cargar 😢</p>";
    }
}

// RENDER
function renderCharacters(characters, data = null) {
    if (!container) return;

    if (characters.length === 0) {
        container.innerHTML = "<p>No se encontraron 😢</p>";
        return;
    }

    const cardsHTML = characters.map(char => `
        <div class="card">
            <img src="${char.image}" alt="${char.name}">
            <h4>${char.name}</h4>
            <p><strong>Ki:</strong> ${char.ki}</p>
            <p><strong>Raza:</strong> ${char.race}</p>
            <p><strong>Afiliación:</strong> ${char.affiliation}</p>
        </div>
    `).join("");

    const gridHTML = `<div class="grid">${cardsHTML}</div>`;

    // INDEX (sin paginación)
    if (esIndex) {
        container.innerHTML = gridHTML;
        return;
    }

    // PERSONAJES (con paginación)
    if (esPersonajes && data) {
        const totalPages = data.meta.totalPages;

        const pagination = `
            <div class="pagination pagination-top">
                <button class="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>⬅ Anterior</button>
                <span>Página ${currentPage} de ${totalPages}</span>
                <button class="next-btn" ${currentPage === totalPages ? 'disabled' : ''}>Siguiente ➡</button>
            </div>
        `;

        const paginationBottom = pagination.replace("pagination-top", "pagination-bottom");

        container.innerHTML = pagination + gridHTML + paginationBottom;

    } else {
        container.innerHTML = gridHTML;
    }
}

// EVENT DELEGATION (PAGINACIÓN)
if (container) {
    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("prev-btn")) {
            if (currentPage > 1) {
                loadCharacters(currentPage - 1, true);
            }
        }

        if (e.target.classList.contains("next-btn")) {
            loadCharacters(currentPage + 1, true);
        }
    });
}

// BUSCADOR
if (searchInput) {

    // Cargar base de datos solo cuando el usuario empieza a usar el buscador
    searchInput.addEventListener("focus", async () => {
        if (allCharacters.length === 0) {
            allCharacters = await getAllCharacters();
        }
    });

    searchInput.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();

        if (value === "") {
            loadCharacters(currentPage, false);
            return;
        }

        const filtered = allCharacters.filter(char =>
            char.name.toLowerCase().includes(value) ||
            char.race.toLowerCase().includes(value) ||
            char.affiliation.toLowerCase().includes(value) ||
            String(char.ki).includes(value)
        );

        currentPage = 1; // reset

        renderCharacters(filtered, null);

        requestAnimationFrame(scrollToTopOfCards);
    });
}

// INIT
async function init() {
    if (esIndex) {
        loadCharacters(1, false);
    }

    if (esPersonajes) {
        loadCharacters(currentPage, false);
    }
}

init();