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
      type: "tabs",
      tabs: [
        {
          label: "Textos de la Sección",
          fields: [
            {
              name: "tagline",
              type: "text",
              label: "Subtítulo / Tagline superior",
              defaultValue: "EXPERIENCIAS & ENCUENTROS",
              admin: {
                description: "Texto pequeño en mayúsculas sobre el título principal.",
              },
            },
            {
              name: "title",
              type: "text",
              label: "Título de la Sección",
              defaultValue: "Talleres en Vivo & Próximas Ferias en Cartagena",
            },
            {
              name: "description",
              type: "textarea",
              label: "Descripción de la Sección",
              defaultValue:
                "Vive el arte de tejer mostacilla en nuestro taller o encuéntranos en las ferias artesanales del Centro Histórico.",
            },
          ],
        },
        {
          label: "Video del Taller (Formato Celular 9:16)",
          fields: [
            {
              name: "video",
              type: "upload",
              relationTo: "media",
              label: "Video del Taller (Subir archivo .mp4 grabado con celular)",
              admin: {
                description:
                  "Sube un video vertical en formato celular (9:16 / estilo Reel). Tiene prioridad sobre la URL.",
              },
            },
            {
              name: "videoUrl",
              type: "text",
              label: "O URL directa de video (opcional)",
              defaultValue:
                "https://assets.mixkit.co/videos/preview/mixkit-hands-of-an-artisan-weaving-a-basket-43403-large.mp4",
              admin: {
                description: "Enlace directo MP4 si el video está alojado externamente.",
              },
            },
            {
              name: "videoCaption",
              type: "text",
              label: "Texto al pie del video",
              defaultValue: "El arte de tejer paciencia: experiencia vivencial en Cartagena con Shirley.",
              admin: {
                description: "Frase descriptiva que acompaña el video vertical en la tienda.",
              },
            },
          ],
        },
      ],
    },
  ],
}
