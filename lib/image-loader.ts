'use client'

import { ImageLoader } from "next/image"

export const imageLoader: ImageLoader = ({ src, width, quality }) => {
  return `http://localhost:3000/_next/image?${src}?w=${width}&q=${quality || 75}`
}