const container = document.getElementById("personajes-container");

async function loadCharacters() {
    try {
        container.innerHTML = "<p>Cargando personajes...</p>";

        const res = await fetch("https://dragonball-api.com/api/characters?limit=10");
        const data = await res.json();

        // limpiar antes de renderizar
        container.innerHTML = "";

        const grid = document.createElement("div");
        grid.className = "grid";

        data.items.forEach(char => {
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <img src="${char.image}" alt="${char.name}">
                <h4>${char.name}</h4>
                <p><strong>Ki:</strong> ${char.ki}</p>
                <p><strong>Raza:</strong> ${char.race}</p>
                <p><strong>Afiliación:</strong> ${char.affiliation}</p>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);

    } catch (error) {
        console.error("Error cargando personajes:", error);
        container.innerHTML = "<p>Error al cargar personajes 😢</p>";
    }
}

loadCharacters();