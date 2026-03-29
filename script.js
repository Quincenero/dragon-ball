const container = document.getElementById("personajes-container");

let allCharacters = [];       // 👉 TODOS (para buscar)
let currentCharacters = [];   // 👉 Página actual
let currentPage = 1;
const limit = 12;

// 👉 Detectar página
const esIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/";
const esPersonajes = window.location.pathname.includes("personajes.html");


// 🔥 TRAER TODOS LOS PERSONAJES (para buscador global)
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
        console.error("Error cargando TODOS los personajes:", error);
        return [];
    }
}


// 🔥 CARGAR TODOS AL INICIO
async function initAllCharacters() {
    container.innerHTML = "<p>Cargando base de datos...</p>";
    allCharacters = await getAllCharacters();
}


// 🔥 CARGAR PERSONAJES POR PÁGINA
async function loadCharacters(page = 1) {
    try {
        container.innerHTML = "<p>Cargando personajes...</p>";

        const res = await fetch(`https://dragonball-api.com/api/characters?page=${page}&limit=${limit}`);
        const data = await res.json();

        currentCharacters = data.items;

        renderCharacters(currentCharacters, data);

    } catch (error) {
        console.error("Error cargando personajes:", error);
        container.innerHTML = "<p>Error al cargar personajes 😢</p>";
    }
}


// 🔥 RENDER
function renderCharacters(characters, data = null) {

    // 👉 Si no hay resultados
    if (characters.length === 0) {
        container.innerHTML = "<p>No se encontraron personajes 😢</p>";
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

    // 👉 INDEX (sin paginación)
    if (esIndex) {
        container.innerHTML = gridHTML;
        return;
    }

    // 👉 PERSONAJES (con paginación SOLO si no estás buscando)
    if (esPersonajes && data) {
        const paginationHTML = `
            <div class="pagination">
                <button id="prev">⬅</button>
                <span>Página ${data.meta.currentPage} de ${data.meta.totalPages}</span>
                <button id="next">➡</button>
            </div>
        `;

        container.innerHTML = gridHTML + paginationHTML;

        const prevBtn = document.getElementById("prev");
        const nextBtn = document.getElementById("next");

        // Desactivar botones
        prevBtn.disabled = data.meta.currentPage === 1;
        nextBtn.disabled = data.meta.currentPage === data.meta.totalPages;

        prevBtn.onclick = () => {
            currentPage--;
            loadCharacters(currentPage);
        };

        nextBtn.onclick = () => {
            currentPage++;
            loadCharacters(currentPage);
        };
    } else {
        container.innerHTML = gridHTML;
    }
}


// 🔥 BUSCADOR GLOBAL
const searchInput = document.getElementById("search");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        // 👉 Si está vacío → volver a paginación normal
        if (value === "") {
            loadCharacters(currentPage);
            return;
        }

        const filtered = allCharacters.filter(char =>
            char.name.toLowerCase().includes(value) ||
            char.race.toLowerCase().includes(value) ||
            char.affiliation.toLowerCase().includes(value) ||
            String(char.ki).includes(value)
        );

        // 👉 Render SIN paginación
        renderCharacters(filtered, null);
    });
}


// 🔥 INIT
async function init() {
    await initAllCharacters(); // 👉 cargar TODOS para búsqueda

    if (esIndex) {
        loadCharacters(1);
    }

    if (esPersonajes) {
        loadCharacters(currentPage);
    }
}

init();