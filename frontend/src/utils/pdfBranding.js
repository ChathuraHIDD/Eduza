let logoDataUrlPromise = null

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read logo blob'))
    reader.readAsDataURL(blob)
  })
}

async function getLogoDataUrl() {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = fetch('/images/eduza-logo.png')
      .then((res) => {
        if (!res.ok) throw new Error('Logo not found')
        return res.blob()
      })
      .then((blob) => blobToDataUrl(blob))
  }

  return logoDataUrlPromise
}

export async function drawEduzaLogo(doc, x, y, width = 56, height = 36) {
  try {
    const dataUrl = await getLogoDataUrl()
    doc.addImage(dataUrl, 'PNG', x, y, width, height)
    return true
  } catch {
    return false
  }
}
