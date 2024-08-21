import parseUri from 'parse-uri'

export function stringToUri(value: string) {
    return parseUri(value)
}
