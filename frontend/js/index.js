// Variables globales
let allVideos = [];
let filteredVideos = [];
let currentCategory = 'all';

// Función que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar el estado de la sesión
    checkLoginStatus();
    
    // Cargar categorías y videos
    loadCategorias();
    loadVideos();

    // Configurar eventos
    setupEventListeners();
});

// Función para verificar el estado de la sesión
function checkLoginStatus() {
    const usuarioJSON = localStorage.getItem('usuario');
    
    // Obtener los contenedores de usuario
    const authButtons = document.querySelector('.user-container');
    
    if (usuarioJSON) {
        // Si hay un usuario en sesión, mostrar el menú de usuario
        const usuario = JSON.parse(usuarioJSON);
        
        // Reemplazar los botones de login/registro por el menú de usuario
        authButtons.innerHTML = `
            <div class="user-dropdown">
                <button class="dropdown-btn" id="user-name">${usuario.nombre_usuario}</button>
                <div class="dropdown-content">
                    <a href="html/dashboard.html"><i class="fas fa-user"></i> Mi cuenta</a>
                    <a href="html/subir-video.html"><i class="fas fa-upload"></i> Subir video</a>
                    <a href="#" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Cerrar sesión</a>
                </div>
            </div>
        `;
        
        // Agregar evento de cierre de sesión
        document.getElementById('btn-logout').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuario');
            window.location.reload();
        });
    } else {
        // Si no hay usuario en sesión, mostrar los botones de login/registro
        authButtons.innerHTML = `
            <a href="html/login.html" class="btn-login">Iniciar Sesión</a>
            <a href="html/registro.html" class="btn-register">Registrarse</a>
        `;
    }
}

// Función para cargar categorías
async function loadCategorias() {
    try {
        const response = await fetch(`${API_URL}/generos`);
        if (!response.ok) {
            throw new Error('Error al cargar las categorías');
        }
        
        const categorias = await response.json();
        displayCategorias(categorias);
        
        // Verificar si hay un parámetro de género en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const generoId = urlParams.get('categoria');
        
        if (generoId) {
            // Activar la categoría correspondiente
            currentCategory = generoId;
            
            // Actualizar visualmente la categoría seleccionada
            document.querySelectorAll('.categoria-item').forEach(item => {
                const itemId = item.getAttribute('data-id');
                item.classList.toggle('active', itemId === currentCategory);
            });
            
            // Cargar videos filtrados por esta categoría
            loadVideos().then(() => {
                filterVideosByCategory(currentCategory);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar las categorías');
    }
}

// Función para mostrar categorías en la barra lateral
function displayCategorias(categorias) {
    const categoriasLista = document.getElementById('categorias-lista');
    
    // Mantener el elemento "Inicio" y agregar las categorías
    const categoriaItems = categorias.map(categoria => `
        <li class="categoria-item" data-id="${categoria.id_genero}">
            <i class="fas fa-tag"></i> ${categoria.nombre}
        </li>
    `).join('');
    
    // Agregamos categorías después del "Inicio"
    categoriasLista.innerHTML += categoriaItems;
    
    // Agregamos los event listeners para las categorías
    document.querySelectorAll('.categoria-item').forEach(item => {
        item.addEventListener('click', () => {
            // Quitar clase 'active' de todos los items
            document.querySelectorAll('.categoria-item').forEach(cat => cat.classList.remove('active'));
            
            // Añadir clase 'active' al item seleccionado
            item.classList.add('active');
            
            // Obtener el ID de la categoría
            currentCategory = item.getAttribute('data-id');
            
            // Filtrar videos por categoría
            filterVideosByCategory(currentCategory);
            
            // Actualizar la URL para reflejar la categoría seleccionada
            if (currentCategory === 'all') {
                // Si es "Todos", quitar el parámetro de la URL
                const newUrl = window.location.pathname;
                window.history.pushState({}, '', newUrl);
            } else {
                // Si es una categoría específica, añadir a la URL
                const newUrl = `${window.location.pathname}?categoria=${currentCategory}`;
                window.history.pushState({}, '', newUrl);
            }
        });
    });
}

// Cargar videos desde la API
async function loadVideos() {
    try {
        const response = await fetch(`${API_URL}/videos`);
        if (!response.ok) {
            throw new Error('Error al cargar los videos');
        }
        
        allVideos = await response.json();
        filterVideosByCategory(currentCategory);
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar los videos');
        
        // Ocultar el spinner de carga
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Función para filtrar videos por categoría
function filterVideosByCategory(categoryId) {
    // Mostrar spinner de carga
    const videosGrid = document.getElementById('videos-grid');
    videosGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando videos...</p>
        </div>
    `;
    
    if (categoryId === 'all') {
        // Si es "Todos", mostrar todos los videos
        filteredVideos = [...allVideos];
    } else {
        // Filtrar por categoría
        filteredVideos = allVideos.filter(video => video.id_genero == categoryId);
    }
    
    // Mostrar los videos filtrados
    displayVideos(filteredVideos);
    
    // Actualizar título de la sección según la categoría
    updateCategoryTitle(categoryId);
}

// Función para actualizar el título de la sección según la categoría seleccionada
function updateCategoryTitle(categoryId) {
    const sectionTitle = document.querySelector('.videos-container h2');
    
    if (categoryId === 'all') {
        sectionTitle.textContent = 'Videos populares';
    } else {
        // Buscar el nombre de la categoría
        const categoriaItem = document.querySelector(`.categoria-item[data-id="${categoryId}"]`);
        if (categoriaItem) {
            const nombreCategoria = categoriaItem.textContent.trim();
            sectionTitle.textContent = `Videos de ${nombreCategoria}`;
        }
    }
}

// Mostrar videos en la grid
function displayVideos(videos) {
    const videosGrid = document.getElementById('videos-grid');
    
    // Ocultar el spinner de carga
    document.querySelector('.loading-spinner').style.display = 'none';
    
    if (videos.length === 0) {
        videosGrid.innerHTML = '<div class="no-videos">No se encontraron videos en esta categoría</div>';
        return;
    }
    
    const videosHTML = videos.map(video => `
        <div class="video-card" data-id="${video.id_video}">
            <div class="video-thumbnail">
                <img src="${getYouTubeThumbnail(video.url_video)}" alt="${video.titulo}">
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.titulo}</h3>
                <div class="video-meta">
                    <span class="video-uploader">${video.nombre_usuario}</span>
                    <span class="video-date">${formatDate(video.fecha_subida)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    videosGrid.innerHTML = videosHTML;
    
    // Agregamos los event listeners para los videos
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-id');
            window.location.href = `html/video.html?id=${videoId}`;
        });
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Buscador
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
}

// Normalizar texto (quitar acentos)
function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Calcular la distancia de Levenshtein (para búsqueda con tolerancia a errores)
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Inicializar la matriz
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Rellenar la matriz
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // sustitución
                    Math.min(
                        matrix[i][j - 1] + 1, // inserción
                        matrix[i - 1][j] + 1  // eliminación
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Realizar búsqueda: ahora usa el endpoint /api/search con la URL base correcta
function performSearch(query) {
    // Si la búsqueda está vacía, mostramos todos los videos
    if (!query.trim()) {
        filterVideosByCategory(currentCategory);
        return;
    }

    // Mostrar indicador de carga
    const videosGrid = document.getElementById('videos-grid');
    videosGrid.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Buscando videos...</p>
        </div>
    `;

    // Realizar la petición al endpoint de búsqueda del backend
    fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('Resultados de búsqueda:', data);
            
            // Actualizar la visualización con los videos filtrados
            displayVideos(data);
            showResultsMessage(data.length, query);
        })
        .catch(error => {
            console.error('Error al realizar la búsqueda:', error);
            videosGrid.innerHTML = `
                <div class="error-message">
                    <p>Error al realizar la búsqueda. Inténtalo de nuevo.</p>
                </div>
            `;
        });
}

function showResultsMessage(count, query) {
    const videosContainer = document.querySelector('.videos-container');
    const videosGrid = document.getElementById('videos-grid');

    // Eliminar mensaje anterior si existe
    const oldMessage = document.querySelector('.search-results-message');
    if (oldMessage) {
        oldMessage.remove();
    }

    // Crear mensaje de resultados
    const resultsMessage = document.createElement('div');
    resultsMessage.className = 'search-results-message';

    if (count === 0) {
        resultsMessage.innerHTML = `
            <p>No se encontraron resultados para: "${query}"</p>
            <button class="btn-clear-search">Ver todos los videos</button>
        `;
    } else {
        resultsMessage.innerHTML = `
            <p>Se encontraron ${count} resultados para: "${query}"</p>
            <button class="btn-clear-search">Limpiar búsqueda</button>
        `;
    }

    videosContainer.insertBefore(resultsMessage, videosGrid);

    // Agregar evento al botón para limpiar búsqueda
    document.querySelector('.btn-clear-search').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        resultsMessage.remove();
        filterVideosByCategory(currentCategory);
    });
}

// Estilos para los mensajes de búsqueda
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-results-message {
        margin: 1rem 0;
        padding: 0.8rem 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .btn-clear-search {
        padding: 0.5rem 1rem;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    
    .btn-clear-search:hover {
        background-color: #e0e0e0;
    }
    
    .no-results {
        text-align: center;
        padding: 3rem;
        color: #666;
    }
`;
document.head.appendChild(searchStyles);

// CSS para los resultados de búsqueda
const style = document.createElement('style');
style.textContent = `
    .search-result-count {
        margin-bottom: 1rem;
        padding: 0.8rem;
        background-color: #f0f0f0;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .btn-clear-search {
        padding: 0.5rem 1rem;
        background-color: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    }
    
    .btn-clear-search:hover {
        background-color: #eee;
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
    }
`;
document.head.appendChild(style);
