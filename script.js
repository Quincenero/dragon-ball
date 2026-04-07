const container = document.getElementById("personajes-container");

let allCharacters = [];
let currentCharacters = [];
let currentPage = 1;
const limit = 12;

// Detectar página
const esIndex = window.location.pathname.includes("index.html") || window.location.pathname === "/";
const esPersonajes = window.location.pathname.includes("personajes.html");

// FUNCIÓN PARA SCROLL AL INICIO DE LAS CARDS
function scrollToTopOfCards() {
    // Buscar la grid o la paginación superior
    const grid = document.querySelector('.grid');
    const paginationTop = document.querySelector('.pagination-top');
    
    if (grid) {
        // Scroll suave hasta la grid
        grid.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    } else if (paginationTop) {
        // Si no hay grid, scroll a la paginación superior
        paginationTop.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
        });
    } else {
        // Fallback: scroll al contenedor principal
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// TRAER TODOS LOS PERSONAJES
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

async function initAllCharacters() {
    if (container) {
        container.innerHTML = "<p>Cargando base de datos...</p>";
    }
    allCharacters = await getAllCharacters();
}

// CARGAR PERSONAJES POR PÁGINA
async function loadCharacters(page = 1, shouldScroll = true) {
    if (!container) return;
    
    try {
        container.innerHTML = "<p>Cargando personajes...</p>";

        const res = await fetch(`https://dragonball-api.com/api/characters?page=${page}&limit=${limit}`);
        const data = await res.json();

        currentCharacters = data.items;
        renderCharacters(currentCharacters, data);
        
        // Scroll al inicio después de cargar
        if (shouldScroll) {
            setTimeout(() => {
                scrollToTopOfCards();
            }, 100);
        }

    } catch (error) {
        console.error("Error cargando personajes:", error);
        container.innerHTML = "<p>Error al cargar personajes 😢</p>";
    }
}

// RENDER
function renderCharacters(characters, data = null) {
    if (!container) return;
    
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

    // INDEX (sin paginación)
    if (esIndex) {
        container.innerHTML = gridHTML;
        return;
    }

    // PERSONAJES (con paginación)
    if (esPersonajes && data) {
        const currentPageNum = data.meta.currentPage;
        const totalPages = data.meta.totalPages;
        
        const paginationTopHTML = `
            <div class="pagination pagination-top">
                <button class="prev-btn" ${currentPageNum === 1 ? 'disabled' : ''}>⬅ Anterior</button>
                <span>Página ${currentPageNum} de ${totalPages}</span>
                <button class="next-btn" ${currentPageNum === totalPages ? 'disabled' : ''}>Siguiente ➡</button>
            </div>
        `;

        const paginationBottomHTML = `
            <div class="pagination pagination-bottom">
                <button class="prev-btn" ${currentPageNum === 1 ? 'disabled' : ''}>⬅ Anterior</button>
                <span>Página ${currentPageNum} de ${totalPages}</span>
                <button class="next-btn" ${currentPageNum === totalPages ? 'disabled' : ''}>Siguiente ➡</button>
            </div>
        `;

        container.innerHTML = paginationTopHTML + gridHTML + paginationBottomHTML;

        // Agregar eventos a TODOS los botones
        const allPrevButtons = document.querySelectorAll('.prev-btn');
        const allNextButtons = document.querySelectorAll('.next-btn');
        
        // Función para página anterior
        const goToPrevPage = () => {
            if (currentPage > 1) {
                currentPage--;
                loadCharacters(currentPage, true);
            }
        };
        
        // Función para página siguiente
        const goToNextPage = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadCharacters(currentPage, true);
            }
        };
        
        // Asignar eventos a todos los botones "Anterior"
        allPrevButtons.forEach(btn => {
            btn.onclick = goToPrevPage;
        });
        
        // Asignar eventos a todos los botones "Siguiente"
        allNextButtons.forEach(btn => {
            btn.onclick = goToNextPage;
        });
    } else {
        container.innerHTML = gridHTML;
    }
}

// BUSCADOR GLOBAL
const searchInput = document.getElementById("search");

if (searchInput) {
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

        renderCharacters(filtered, null);
        
        // Scroll al inicio de los resultados
        setTimeout(() => {
            const grid = document.querySelector('.grid');
            if (grid) {
                grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);
    });
}

// INIT
async function init() {
    await initAllCharacters();

    if (esIndex) {
        loadCharacters(1, false);
    }

    if (esPersonajes) {
        loadCharacters(currentPage, false);
    }
}

// Iniciar la aplicación
init();