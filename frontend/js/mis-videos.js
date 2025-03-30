// Variables globales
let currentUser = null;
let userVideos = [];
let genres = [];
let videoToDelete = null;

// Ejecutar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario en sesión
    currentUser = checkSession();
    
    if (currentUser) {
        // Mostrar el nombre del usuario
        document.getElementById('user-name').textContent = currentUser.nombre_usuario;
        
        // Cargar los videos del usuario
        loadUserVideos();
        
        // Cargar las categorías
        loadCategories();
        
        // Configurar eventos
        setupEventListeners();
    }
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

// Cargar los videos del usuario
async function loadUserVideos() {
    try {
        const response = await fetch(`${API_URL}/videos/usuario/${currentUser.id_usuario}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar los videos del usuario');
        }
        
        userVideos = await response.json();
        
        // Mostrar los videos en la interfaz
        displayUserVideos();
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudieron cargar tus videos');
        
        // Ocultar el spinner de carga
        document.getElementById('loading-spinner').style.display = 'none';
    }
}

// Mostrar los videos del usuario en la interfaz
function displayUserVideos() {
    const videosContainer = document.getElementById('videos-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const noVideosMessage = document.getElementById('no-videos');
    
    // Ocultar el spinner de carga
    loadingSpinner.style.display = 'none';
    
    // Verificar si hay videos
    if (userVideos.length === 0) {
        noVideosMessage.style.display = 'block';
        videosContainer.innerHTML = '';
        return;
    }
    
    // Ordenar los videos por fecha (más recientes primero)
    userVideos.sort((a, b) => new Date(b.fecha_subida) - new Date(a.fecha_subida));
    
    // Generar el HTML para los videos
    const videosHTML = userVideos.map(video => `
        <div class="video-card" data-id="${video.id_video}">
            <div class="video-thumbnail">
                <img src="${getYouTubeThumbnail(video.url_video)}" alt="${video.titulo}">
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.titulo}</h3>
                <div class="video-meta">
                    <span>${formatDate(video.fecha_subida)}</span>
                    <div class="video-stats">
                        <span><i class="fas fa-eye"></i> ${video.visitas || 0}</span>
                        <span><i class="fas fa-comment"></i> ${video.comentarios_count || 0}</span>
                    </div>
                </div>
            </div>
            <div class="video-actions">
                <button class="action-btn view-btn" data-id="${video.id_video}">
                    <i class="fas fa-play"></i> Ver
                </button>
                <button class="action-btn edit-btn" data-id="${video.id_video}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="action-btn delete-btn" data-id="${video.id_video}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
    
    videosContainer.innerHTML = videosHTML;
    
    // Agregar event listeners a los botones de acción
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-id');
            window.location.href = `video.html?id=${videoId}`;
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-id');
            openEditModal(videoId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-id');
            openDeleteModal(videoId);
        });
    });
}

// Cargar las categorías
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/generos`);
        
        if (!response.ok) {
            throw new Error('Error al cargar las categorías');
        }
        
        genres = await response.json();
        
        // Cargar las categorías en la barra lateral
        displayCategoriesLateral();
        
        // También cargar las categorías en el select del modal de edición
        const selectGenero = document.getElementById('edit-id-genero');
        
        genres.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id_genero;
            option.textContent = categoria.nombre;
            selectGenero.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar categorías en la barra lateral
function displayCategoriesLateral() {
    const categoriasLista = document.getElementById('categorias-lista');
    const separatorElement = document.querySelector('.separator');
    
    // Mostrar solo las primeras 10 categorías
    const categoriasSlice = genres.slice(0, 10);
    
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

// Abrir el modal de edición
function openEditModal(videoId) {
    // Encontrar el video por su ID
    const video = userVideos.find(v => v.id_video == videoId);
    
    if (!video) {
        showError('Video no encontrado');
        return;
    }
    
    // Llenar el formulario con los datos del video
    document.getElementById('edit-id-video').value = video.id_video;
    document.getElementById('edit-titulo').value = video.titulo;
    document.getElementById('edit-descripcion').value = video.descripcion || '';
    document.getElementById('edit-url-video').value = video.url_video;
    document.getElementById('edit-id-genero').value = video.id_genero;
    
    // Mostrar el modal
    document.getElementById('edit-modal').style.display = 'block';
}

// Abrir el modal de eliminación
function openDeleteModal(videoId) {
    // Encontrar el video por su ID
    const video = userVideos.find(v => v.id_video == videoId);
    
    if (!video) {
        showError('Video no encontrado');
        return;
    }
    
    // Guardar el ID del video a eliminar
    videoToDelete = video.id_video;
    
    // Mostrar el título del video en el mensaje de confirmación
    document.getElementById('delete-video-title').textContent = video.titulo;
    
    // Mostrar el modal
    document.getElementById('delete-modal').style.display = 'block';
}

// Configurar los event listeners
function setupEventListeners() {
    // Evento de cierre de sesión
    document.getElementById('btn-logout').addEventListener('click', handleLogout);
    
    // Eventos para los modales
    document.querySelectorAll('.close-modal').forEach(element => {
        element.addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
            document.getElementById('delete-modal').style.display = 'none';
        });
    });
    
    // Cerrar modales al hacer clic fuera de ellos
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('edit-modal')) {
            document.getElementById('edit-modal').style.display = 'none';
        }
        if (event.target === document.getElementById('delete-modal')) {
            document.getElementById('delete-modal').style.display = 'none';
        }
    });
    
    // Evento para el formulario de edición
    document.getElementById('edit-form').addEventListener('submit', handleEditSubmit);
    
    // Evento para confirmar eliminación
    document.getElementById('confirm-delete').addEventListener('click', handleDeleteVideo);
    
    /* Evento de búsqueda
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });*/
}

// Manejar el envío del formulario de edición
async function handleEditSubmit(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const idVideo = document.getElementById('edit-id-video').value;
    const titulo = document.getElementById('edit-titulo').value.trim();
    const descripcion = document.getElementById('edit-descripcion').value.trim();
    const urlVideo = document.getElementById('edit-url-video').value.trim();
    const idGenero = document.getElementById('edit-id-genero').value;
    
    // Validar campos
    if (!titulo || !urlVideo || !idGenero) {
        showError('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    try {
        // Enviar la petición de actualización
        const response = await fetch(`${API_URL}/videos/${idVideo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo,
                descripcion,
                url_video: urlVideo,
                id_genero: idGenero
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al actualizar el video');
        }
        
        // Cerrar el modal
        document.getElementById('edit-modal').style.display = 'none';
        
        // Recargar los videos
        loadUserVideos();
        
        // Mostrar mensaje de éxito
        alert('Video actualizado correctamente');
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudo actualizar el video');
    }
}

// Manejar la eliminación de un video
async function handleDeleteVideo() {
    if (!videoToDelete) return;
    
    try {
        // Enviar la petición de eliminación
        const response = await fetch(`${API_URL}/videos/${videoToDelete}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar el video');
        }
        
        // Cerrar el modal
        document.getElementById('delete-modal').style.display = 'none';
        
        // Eliminar el video del array local
        userVideos = userVideos.filter(video => video.id_video != videoToDelete);
        
        // Actualizar la interfaz
        displayUserVideos();
        
        // Resetear la variable
        videoToDelete = null;
        
        // Mostrar mensaje de éxito
        alert('Video eliminado correctamente');
    } catch (error) {
        console.error('Error:', error);
        showError('No se pudo eliminar el video');
    }
}

// Realizar búsqueda
function performSearch(query) {
    if (query.trim()) {
        window.location.href = `../index.html?buscar=${encodeURIComponent(query)}`;
    }
}

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