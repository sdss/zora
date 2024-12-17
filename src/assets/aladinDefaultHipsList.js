// copy the original default list of hips from
// https://github.com/cds-astro/aladin-lite/blob/master/src/js/DefaultHiPSList.js
// and extend it with additional defaults;
// do this until the "hiplist" options does not override the default list
let HiPSList = (function () {
    function HiPSList() {}

    HiPSList.DEFAULT = [
        {
            creatorDid: "ivo://CDS/P/DSS2/color",
            name: "DSS colored",
            id: "P/DSS2/color",
            maxOrder: 9,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "ICRS",
            startUrl: "https://alasky.cds.unistra.fr/DSS/DSSColor",
        },
        {
            creatorDid: "ivo://CDS/P/2MASS/color",
            name: "2MASS colored",
            id: "P/2MASS/color",
            maxOrder: 9,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "ICRS",
            startUrl: "https://alaskybis.cds.unistra.fr/2MASS/Color",
        },
        {
            creatorDid: "ivo://CDS/P/DSS2/red",
            name: "DSS2 Red (F+R)",
            id: "P/DSS2/red",
            maxOrder: 9,
            tileSize: 512,
            imgFormat: "fits",
            cooFrame: "ICRS",
            numBitsPerPixel: 16,
            // options
            minCut: 1000.0,
            maxCut: 10000.0,
            colormap: "magma",
            stretch: "Linear",
            imgFormat: "fits",
            startUrl: "https://alaskybis.cds.unistra.fr/DSS/DSS2Merged",
        },
        {
            creatorDid: "ivo://CDS/P/DM/I/350/gaiaedr3",
            name: "Density map for Gaia EDR3 (I/350/gaiaedr3)",
            id: "P/DM/I/350/gaiaedr3",
            maxOrder: 7,
            tileSize: 512,
            numBitsPerPixel: -32,
            cooFrame: "ICRS",
            minCut: 0,
            maxCut: 12000,
            stretch: "asinh",
            colormap: "rdylbu",
            imgFormat: "fits",
            startUrl: "https://alaskybis.cds.unistra.fr/ancillary/GaiaEDR3/density-map",
        },
        {
            creatorDid: "ivo://CDS/P/PanSTARRS/DR1/g",
            name: "PanSTARRS DR1 g",
            id: "P/PanSTARRS/DR1/g",
            maxOrder: 11,
            tileSize: 512,
            imgFormat: "fits",
            cooFrame: "ICRS",
            numBitsPerPixel: -32,
            // options
            minCut: -34,
            maxCut: 7000,
            stretch: "asinh",
            colormap: "redtemperature",
            startUrl: "https://alasky.cds.unistra.fr/Pan-STARRS/DR1/g"
        },
        {
            creatorDid: "ivo://CDS/P/PanSTARRS/DR1/color-z-zg-g",
            name: "PanSTARRS DR1 color",
            id: "P/PanSTARRS/DR1/color-z-zg-g",
            maxOrder: 11,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "ICRS",
            startUrl: "https://alasky.cds.unistra.fr/Pan-STARRS/DR1/color-z-zg-g",
        },
        {
            creatorDid: "ivo://CDS/P/DECaPS/DR2/color",
            name: "DECaPS DR2 color",
            id: "P/DECaPS/DR2/color",
            maxOrder: 11,
            cooFrame: "equatorial",
            tileSize: 512,
            imgFormat: "png",
            startUrl: "https://alasky.cds.unistra.fr/DECaPS/DR2/CDS_P_DECaPS_DR2_color"
        },
        {
            creatorDid: "ivo://CDS/P/Fermi/color",
            name: "Fermi color",
            id: "P/Fermi/color",
            maxOrder: 3,
            imgFormat: "jpeg",
            tileSize: 512,
            cooFrame: "equatorial",
            startUrl: "https://alasky.cds.unistra.fr/Fermi/Color",
        },
        {
            creatorDid: "ivo://CDS/P/GALEXGR6_7/NUV",
            id: "P/GALEXGR6_7/NUV",
            name: "GALEXGR6_7 NUV",
            maxOrder: 8,
            imgFormat: "png",
            tileSize: 512,
            cooFrame: "equatorial",
            startUrl: "https://alasky.cds.unistra.fr/GALEX/GALEXGR6_7_NUV"
        },
        {
            creatorDid: "ivo://CDS/P/IRIS/color",
            id: "P/IRIS/color",
            name: "IRIS colored",
            maxOrder: 3,
            tileSize: 256,
            imgFormat: "jpeg",
            cooFrame: "galactic",
            startUrl: "https://alasky.cds.unistra.fr/IRISColor",
        },
        {
            creatorDid: "ivo://CDS/P/Mellinger/color",
            id: "P/Mellinger/color",
            name: "Mellinger colored",
            maxOrder: 4,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "galactic",
            startUrl: "https://alasky.cds.unistra.fr/MellingerRGB"
        },
        {
            creatorDid: "ivo://CDS/P/SDSS9/color",
            id: "P/SDSS9/color",
            name: "SDSS9 colored",
            maxOrder: 10,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "equatorial",
            startUrl: "https://alasky.cds.unistra.fr/SDSS/DR9/color"
        },
        {
            creatorDid: "ivo://CDS/P/SPITZER/color",
            id: "P/SPITZER/color",
            name: "IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)",
            maxOrder: 9,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "galactic",
            startUrl: "https://alasky.cds.unistra.fr/Spitzer/SpitzerI1I2I4color"
        },
        {
            creatorDid: "ivo://CDS/P/allWISE/color",
            id: "P/allWISE/color",
            name: "AllWISE color",
            maxOrder: 8,
            tileSize: 512,
            imgFormat: "jpeg",
            cooFrame: "equatorial",
            startUrl: "https://alaskybis.cds.unistra.fr/AllWISE/RGB-W4-W2-W1"
        },
        {
            creatorDid: "ivo://CDS/P/SDSS9/g",
            id: "P/SDSS9/g",
            name: "SDSS9 band-g",
            maxOrder: 10,
            tileSize: 512,
            numBitsPerPixel: 16,
            imgFormat: "fits",
            cooFrame: "equatorial",
            minCut: 0,
            maxCut: 1.8,
            stretch: "linear",
            colormap: "redtemperature",
            startUrl: "https://alasky.cds.unistra.fr/SDSS/DR9/band-g"
        },
        {
            id: "P/Finkbeiner",
            name: "Halpha",
            maxOrder: 3,
            minCut: -10,
            maxCut: 800,
            colormap: "rdbu",
            imgFormat: "fits",
            startUrl: "https://alasky.cds.unistra.fr/FinkbeinerHalpha"
        },
        {
            id: "P/VTSS/Ha",
            name: "VTSS-Ha",
            maxOrder: 3,
            minCut: -10.0,
            maxCut: 100.0,
            colormap: "grayscale",
            imgFormat: "fits",
            startUrl: "https://alasky.cds.unistra.fr/VTSS/Ha"
        },
        {
            id: "P/GLIMPSE360",
            name: "GLIMPSE360",
            maxOrder: 9,
            imgFormat: "jpeg",
            minOrder: 3,
            startUrl: "https://alasky.cds.unistra.fr/IPAC/IPAC_P_GLIMPSE360"
        },
        // added defaults starting here
        {
            creatorDid: "ivo://CDS/P/DESI-Legacy-Surveys/DR10/color",
            id: "P/DESI-Legacy-Surveys/DR10/color",
            name: "DESI Legacy Surveys color (g, r, i, z)"
        },
        {
            creatorDid: "ivo://CDS/P/unWISE/color-W2-W1W2-W1",
            id: "P/unWISE/color-W2-W1W2-W1",
            name: "unWISE color, from W2 and W1 bands"
        },
        {
            creatorDid: "ivo://erosita/dr1/rate/rgb",
            id: "erosita/dr1/rate/rgb",
            name: "eROSITA-DE DR1 RGB (0.2-0.5, 0.5-1.0, 1.0-2.0 keV) Rate Image"
        }
    ];

    return HiPSList;
});

export default HiPSList();