// Configuración de producción de la app del jugador.
// La "publishable key" de Supabase es pública por diseño: las tablas están cerradas y solo se puede
// llamar a funciones que validan el código personal de cada jugador.
window.PP_CONFIG = {
  apiUrl: "https://xdqmzyoafqzaeyywrhwx.supabase.co/rest/v1",
  apiKey: "sb_publishable_WjKyWO0Ft-SXrkYlKZI6lg_JiAm31MX",
  vapidPublicKey: "BA75GPYq8sNArmLs2sOvaUTjyWbNYIKYW8m4L0gWy1Wo6vDnEczXED90RCKhD_xjgqY5hecbIoGEExoy1Tvykso",
  horaBienestar: "8:45",
  apkUrl: "https://github.com/rrcorcelles/puntopeak-jugadores/releases/latest/download/PuntoPeak.apk",
};
