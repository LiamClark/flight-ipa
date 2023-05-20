import {CountryFeature, CountryInfo} from "country-locator/dist/types";
import {validateCoordinate} from "country-locator/dist/validation/coordinate-validation";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import {polygon, multiPolygon, Point, Feature} from '@turf/helpers';
import {extractCountryInfoFromCountryFeature} from "country-locator/dist/common/utils/countries-geojson-utils";
import jsonFile from "jsonfile";
import { CountriesGeoJson } from "country-locator/dist/types";
import { GeoLocationRequest } from "./data-definition";


const geo = jsonFile.readFileSync("netherlands.json") as CountriesGeoJson;

export function inNetherlands(r: GeoLocationRequest): boolean {

    // return true
    return (findCountryByCoordinate(r.latitude, r.longitude)?.code ?? "") === "NLD"
}


/**
 * Determines if a given point is in a territory of a country or not
 */
const isPointInCountry = (country: CountryFeature, point: Feature<Point>): boolean => {
    const {type: countryGeoType, coordinates: countryCoordinates} = country.geometry;
    if (countryGeoType === 'Polygon') {
        return booleanPointInPolygon(point, polygon(countryCoordinates));
    } else if (countryGeoType === 'MultiPolygon') {
        return booleanPointInPolygon(point, multiPolygon(countryCoordinates));
    }
    return false;
};


export function findCountryByCoordinate(pointOrLat: number[] | number, longitude?: number): CountryInfo | undefined {
    const coordinate = validateCoordinate(pointOrLat, longitude);
    //replace feature
    geo.features.find(c => isPointInCountry(c, coordinate) )
    const countryFound = geo.features ?.find((country: CountryFeature) => isPointInCountry(country, coordinate));
    if (!countryFound) return;

    return extractCountryInfoFromCountryFeature(countryFound);
}