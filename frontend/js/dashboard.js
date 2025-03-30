// Script para la página de dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario en sesión
    const usuario = checkSession();
    
    if (usuario) {
        // Mostrar el nombre del usuario
        document.getElementById('nombre-usuario').textContent = usuario.nombre_usuario;
        document.getElementById('user-name').textContent = usuario.nombre_usuario;
        
        // Cargar datos del usuario
        loadUserData(usuario.id_usuario);
        
        // Cargar videos del usuario
        loadUserVideos(usuario.id_usuario);
        
        // Cargar categorías
        loadCategorias();
    }
    
    // Configurar evento de cierre de sesión
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    // Configurar evento de búsqueda
    //setupSearchEvents();
});

// Verificar si hay una sesión activa
function checkSession() {
    const usuarioJSON = localStorage.getItem('usuario');
    
    if (!usuarioJSON) {
        // Si no hay un usuario en sesión, redireccionar al login
        window.location.href = 'login.html';
        return null;
    }
    
    return JSON.parse(usuarioJSON);
}

// Cargar datos del usuario
async function loadUserData(userId) {
    try {
        // Cargar cantidad de videos
        const videosResponse = await fetch(`${API_URL}/videos/usuario/${userId}`);
        const videos = await videosResponse.json();
        document.getElementById('count-videos').textContent = videos.length;
        
        // Cargar cantidad de suscriptores
        try {
            const suscriptoresResponse = await fetch(`${API_URL}/suscripciones/cantidad/${userId}`);
            
            if (suscriptoresResponse.ok) {
                const suscriptoresData = await suscriptoresResponse.json();
                document.getElementById('count-suscriptores').textContent = suscriptoresData.cantidad;
            } else {
                document.getElementById('count-suscriptores').textContent = '0';
            }
        } catch (suscriptoresError) {
            console.error('Error al cargar suscriptores:', suscriptoresError);
            document.getElementById('count-suscriptores').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        showError('Error al cargar datos del usuario');
    }
}

// Cargar videos del usuario
async function loadUserVideos(userId) {
    try {
        const response = await fetch(`${API_URL}/videos/usuario/${userId}`);
        const videos = await response.json();
        
        const videosGrid = document.getElementById('user-videos-grid');
        
        // Ocultar el spinner de carga
        const loadingSpinner = document.querySelector('.loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        if (videos.length === 0) {
            videosGrid.innerHTML = `
                <div class="no-videos">
                    <p>Aún no has subido ningún video</p>
                    <a href="subir-video.html" class="btn-primary">Subir mi primer video</a>
                </div>
            `;
            return;
        }
        
        // Mostrar solo los 3 videos más recientes
        const recentVideos = videos.slice(0, 3);
        
        const videosHTML = recentVideos.map(video => `
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
        
        // Agregar eventos a las tarjetas de video
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const videoId = card.getAttribute('data-id');
                window.location.href = `video.html?id=${videoId}`;
            });
        });
    } catch (error) {
        console.error('Error al cargar videos del usuario:', error);
        
        const videosGrid = document.getElementById('user-videos-grid');
        videosGrid.innerHTML = `<div class="error-message">Error al cargar videos</div>`;
    }
}

// Cargar categorías desde la API
async function loadCategorias() {
    try {
        const response = await fetch(`${API_URL}/generos`);
        if (!response.ok) {
            throw new Error('Error al cargar las categorías');
        }
        
        const categorias = await response.json();
        displayCategorias(categorias);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar categorías en la barra lateral
function displayCategorias(categorias) {
    const categoriasLista = document.getElementById('categorias-lista');
    const separatorElement = document.querySelector('.separator');
    
    // Mostrar solo las primeras 10 categorías
    const categoriasSlice = categorias.slice(0, 10);
    
    const categoriaItems = categoriasSlice.map(categoria => `
        <li class="categoria-item">
            <a href="../index.html?categoria=${categoria.id_genero}">
                <i class="fas fa-tag"></i> ${categoria.nombre}
            </a>
        </li>
    `).join('');
    
    // Insertar después del separador
    separatorElement.insertAdjacentHTML('afterend', categoriaItems);
}

/* Configurar eventos de búsqueda
function setupSearchEvents() {
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

// Realizar búsqueda
function performSearch(query) {
    if (query.trim()) {
        window.location.href = `../index.html?buscar=${encodeURIComponent(query)}`;
    }
}*/

// Cerrar sesión
function handleLogout(event) {
    event.preventDefault();
    
    // Eliminar datos del usuario de localStorage
    localStorage.removeItem('usuario');
    
    // Redireccionar al inicio
    window.location.href = '../index.html';
}

// Mostrar mensaje de error
function showError(message) {
    alert(message);
}