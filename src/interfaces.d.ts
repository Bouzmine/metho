interface PouchDBObject {
  _id?: string;
  _rev?: string;
}

interface Project extends PouchDBObject {
  name: string;
  matter: string;
}

interface Source extends PouchDBObject {
  title: string;
  type: string;
  parsedSource?: string;
  parsedType?: string;
  project_id?: string;
  errors?: SourceError[];
  warnings?: SourceError[];
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
  pageNumber?: any;
  // Article
  startPage?: number;
  endPage?: number;
  // Internet
  organization?: string;
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
  data?: any;
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
