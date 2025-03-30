// Configuración global para el frontend
const API_URL = 'http://localhost:3007/api';

// Función para extraer miniatura de YouTube a partir de una URL
function getYouTubeThumbnail(url) {
    // Extraer el ID del video de YouTube
    let videoId;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        videoId = match[2];
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    } else {
        // Si no se puede extraer el ID o no es de YouTube, devolver imagen placeholder
        return 'img/video-placeholder.jpg';
    }
}

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para mostrar mensajes de error
function showError(message) {
    alert(message);
}