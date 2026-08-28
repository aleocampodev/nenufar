import type { ImageStripBlock as Props } from "@/payload-types"
import React from "react"
import { ImageStripClient } from "./Component.client"

export const ImageStripBlock: React.FC<Props & { id?: string }> = (props) => {
  return <ImageStripClient {...props} />
}
