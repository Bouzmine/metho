interface SourceTypes {
  "PROJECT.TYPES.BOOK": string;
  "PROJECT.TYPES.ARTICLE": string;
  "PROJECT.TYPES.INTERNET": string;
  "PROJECT.TYPES.CD_PARSE": string;
  "PROJECT.TYPES.MOVIE": string;
  "PROJECT.TYPES.INTERVIEW": string;
}

interface PouchDBObject {
  _id?: string;
  _rev?: string;
}

interface Project extends PouchDBObject {
  name: string;
  matter: string;
}

interface Source extends PouchDBObject, SourceFields {
  title: string;
  type: string;
  parsedSource?: string;
  parsedType?: string;
  project_id?: string;
  errors?: SourceError[];
  warnings?: SourceError[];
}

interface SourceFields {
  title?: string;
  // General
  author1lastname?: string;
  author1firstname?: string;
  author2lastname?: string;
  author2firstname?: string;
  author3lastname?: string;
  author3firstname?: string;
  // Book
  hasAuthors?: string;
  editionNumber?: number;
  collection?: string;
  hasBeenTranslated?: boolean;
  translatedFrom?: string;
  translator1lastname?: string;
  translator1firstname?: string;
  translator2lastname?: string;
  translator2firstname?: string;
  publicationLocation?: string;
  editor?: string;
  publicationDate?: string;
  volumeNumber?: string;
  pageNumber?: string | number;
  // Article
  startPage?: number;
  endPage?: number;
  // Internet
  url?: string;
  consultationDate?: string;
  // Movie
  episodeTitle?: string;
  productionLocation?: string;
  productor?: string;
  broadcaster?: string;
  duration?: number;
  support?: string;
  // interview
  civility?: string;
  interviewed1lastname?: string;
  interviewed1firstname?: string;
  interviewedTitle?: string;
}

interface SourceError {
  errorTitle: string;
  promptTitle: string;
  promptText: string;
  inputs?: SourceErrorInputs[];
  key?: string;
  var?: string;
  complex?: boolean;
  type?: string;
  options?: SourceErrorOption[];
}

interface SourceErrorInputs {
  var: string;
  example: string;
}

interface SourceErrorOption {
  text: string;
  value: string;
}

interface Pending extends PouchDBObject {
  project_id?: string;
  date: any; // moment.MomentDateObject
  isbn: string;
  isLoaded?: boolean;
  data?: SourceFields;
  notAvailable?: boolean;
  datestring?: string; // Localized datestring
}

interface SettingsList {
  advanced?: boolean;
  scanBoardingDone?: boolean;
  firstname?: string;
  lastname?: string;
  overideLang?: string;
  ignoreErrors?: boolean;
  cdAlertShown?: boolean;
}

interface AttributionsObjects {
  libraries: LibraryObject[];
  licenses: LicenseObject[];
  plugins: string[];
}

interface LicenseObject {
  token: string;
  content: string;
}

interface LibraryObject {
  label: string;
  website: string;
  image: string;
}

interface ReferenceObject {
  id: number;
  name: string;
  header?: boolean;
  description?: string;
  icon?: string;
  text: string;
  containsSub?: boolean;
  card_example: Card[];
  subPages: ReferenceObject[];
}

interface Card {
  type: string;
  title: string;
  // Documentary
  first_title?: string;
  second_title?: string;
  content?: string;
  source?: string;
  // Bibliographical
  biblio_type?: string;
  summary?: string;
  utility?: string;
  cote?: string;
}

interface SearchReferenceObject {
  title: string;
  id: number;
  content: ReferenceObject[];
}

interface ComplexSourceError {
  type: string;
  options: {
    text: string;
    value: string;
  }[];
}

interface Cache {
  [key: string]: SourceFields;
}

interface ISBNdbResponse {
  title: string;
  title_latin: string;
  publisher_name: string;
  edition_info: string;
  publisher_text: string;
  physical_description_text: string;
  author_data: {
    name: string;
  }[];
  isbn13: string;
  isbn10: string;
}

interface OpenLibraryIsbnResponse {
  title: string;
  publishers: {
    name: string;
  }[];
  publish_date: string;
  publish_places: {
    name: string;
  }[];
  number_of_pages: number;
  pagination: string;
  authors: {
    url: string;
    name: string;
  }[];
  by_statement: string;
  url: string;
  notes: string;
}

interface ScanResponse {
  data?: SourceFields;
  transition?: Promise<any>;
  addPending?: boolean;
  isbn?: string;
}

interface TranslationOptions {
  [key: string]: any;
}

interface BarcodeScannerResponse {
  cancelled: boolean;
  format: string;
  text: string;
}

// ionic
interface AlertButton {
  text?: string;
  role?: string;
  handler?: Function;
}
