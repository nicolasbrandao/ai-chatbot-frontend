'use client'

import { ImageLoader } from "next/image"

const imageLoader: ImageLoader = ({ src, width, quality }) => {
  return `/_next/image?url=${src}?w=${width}&q=${quality || 75}`
}

export default imageLoader