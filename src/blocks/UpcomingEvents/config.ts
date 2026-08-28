import type { Block } from "payload"

export const UpcomingEventsBlock: Block = {
  slug: "upcomingEvents",
  labels: {
    singular: "Talleres & Ferias (Video + Calendario)",
    plural: "Bloques de Talleres & Ferias",
  },
  admin: {
    description:
      "Muestra el video vertical del taller (formato celular 9:16) y el calendario interactivo con dropdown de ferias en Cartagena.",
  },
  fields: [
    {
      name: "tagline",
      type: "text",
      label: "Subtítulo / Tagline superior",
      defaultValue: "EXPERIENCIAS & ENCUENTROS",
    },
    {
      name: "title",
      type: "text",
      label: "Título de la sección",
      defaultValue: "Talleres en Vivo & Próximas Ferias en Cartagena",
    },
    {
      name: "description",
      type: "textarea",
      label: "Descripción de la sección",
      defaultValue:
        "Vive el arte de tejer mostacilla en nuestro taller o encuéntranos en las ferias artesanales del Centro Histórico.",
    },
    {
      name: "video",
      type: "upload",
      relationTo: "media",
      label: "Video del Taller (Formato Celular / Reel .mp4)",
      admin: {
        description: "Sube un video vertical 9:16 grabado desde celular.",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      label: "O URL directa de video (opcional)",
      defaultValue: "https://assets.mixkit.co/videos/preview/mixkit-hands-of-an-artisan-weaving-a-basket-43403-large.mp4",
      admin: {
        description: "Enlace directo de video MP4 o CDN.",
      },
    },
    {
      name: "videoCaption",
      type: "text",
      label: "Texto al pie del video",
      defaultValue: "El arte de tejer paciencia: experiencia vivencial en Cartagena con Shirley.",
    },
  ],
}
