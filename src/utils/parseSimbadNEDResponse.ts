interface ResponsePayload {
  status?: string
  message: string
  payload: any
}


export function parseSimbadResponse(data: any): ResponsePayload {

  // Parse the XML string into an XMLDocument
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(data, 'text/xml')

  // Find the INFO element within the XML document suggesting a resolution error
  const infoElement = xmlDoc.querySelector('INFO')

  if (infoElement) {
    // Get error information from the INFO element
    const errorInfo = infoElement.getAttribute('value')
    console.warn(errorInfo)
    return { status: 'error', message: `Simbad: ${errorInfo}`, payload: null }

  } else {

    // Find the relevant elements within the XML document
    const tableData = xmlDoc.querySelector('TABLEDATA')
    const rowData = tableData.querySelector('TR')
    const columns = rowData.querySelectorAll('TD')

    // Extract the data from the columns
    const name: string = columns[0].textContent?.trim() || '' // Main identifier
    const RA_d: number = parseFloat(columns[1].textContent || '') // Right ascension
    const DEC_d: number = parseFloat(columns[2].textContent || '') // Declination

    // Construct the output object
    const output: { name: string, ra: number, dec: number } = { name: name, ra: RA_d, dec: DEC_d }

    return {status: 'success', message: 'Resolved successfully', payload: output }
  }
}


export function parseNEDResponse(data: any): ResponsePayload {
  console.log(data);
  
  // Parse the XML string into an XMLDocument
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(data, 'text/xml')

  // Get the Resolver element
  const resolverElement = xmlDoc.querySelector('Resolver');

  // Find the INFO element within the XML document suggesting a resolution error
  const infoElement = xmlDoc.querySelector('INFO')

  if (infoElement) {
    // Get error information from the INFO element
    const errorInfo = infoElement.textContent
    console.warn(errorInfo)
    return { status: 'error', message: `NED: ${errorInfo}`, payload: null }

  } else {
    // Extract the desired fields
    const jra = resolverElement.querySelector('jradeg')
    const jde = resolverElement.querySelector('jdedeg')

    const name: string = resolverElement.querySelector('oname').textContent
    const jradeg: number = parseFloat(jra.textContent || '')
    const jdedeg: number = parseFloat(jde.textContent || '')
    
    // Construct the output object
    const output: { name: string, ra: number, dec: number } = { name: name, ra: jradeg, dec: jdedeg }

    return { status: 'success', message: 'Resolved successfully', payload: output }
  }

}
